import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  MessageEvent,
  forwardRef,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { ObjectId } from 'mongodb';
import { endWith, map, of, skipLast } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CELERY_CLIENT,
  CeleryClientQueue,
  CeleryClientService,
} from '../../common/celery/celery-client.module';
import { EmailService } from '../../common/email/email.service';
import { REDIS } from '../../common/redis/redis.module';
import { SubscriptionPlanInfoService } from '../../subscription/subscription-plan.service';
import { TaskType } from '../../task/task.schema';
import { TaskService } from '../../task/task.service';
import { UserSparse } from '../../user/user.schema';
import { UserService } from '../../user/user.service';
import { WebhookService } from '../../webhook/webhook.service';
import { WebhookEventType } from '../../webhook/webhook.types';
import { CustomKeyService } from '../custom-key.service';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import {
  checkUserPermissionForKb,
  UserPermissions,
} from '../knowledgebase-utils';

import {
  ChatAnswerFeedbackType,
  ChatQueryAnswer,
  ChatSession,
  ChatSessionMessageSparse,
  ChatSessionSparse,
  CustomKeyData,
  KnowledgebaseStatus,
  ChatMessageForWidget,
  ChatSessionForWidget,
  MessageType,
} from '../knowledgebase.schema';
import { PromptTestDTO, UpdateChatbotSessionDTO } from './chatbot.dto';
import { OpenaiChatbotService } from './openaiChatbotService';
import { WebSocketChatGateway } from '../websocketchat.gateway';

const CHAT_SESION_EXPIRY_TIME = 5 * 60;
const CHUNK_FILTER_THRESHOLD = 0.3;
const SOURCES_FILTER_THRESHOLD = 0.8;

@Injectable()
export class ChatbotService {
  constructor(
    private userService: UserService,
    private kbDbService: KnowledgebaseDbService,
    private openaiChatbotService: OpenaiChatbotService,
    private subPlanInfoService: SubscriptionPlanInfoService,
    private emailService: EmailService,
    private taskService: TaskService,
    private readonly customKeyService: CustomKeyService,
    private readonly webhookService: WebhookService,
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
    @Inject(REDIS) private redis: Redis,
    @Inject(forwardRef(() => WebSocketChatGateway))
    private webSocketChatGateway: WebSocketChatGateway,
  ) {}

  private async putChatSessionDataToCache(sessionData: ChatSession) {
    return this.redis.set(
      `c_${sessionData._id}`,
      JSON.stringify(sessionData),
      'EX',
      CHAT_SESION_EXPIRY_TIME,
    );
  }

  async getChatSessionDataFromCache(sessionId: string) {
    const sessionKey = `c_${sessionId}`;
    const sId = new ObjectId(sessionId);
    const data = await this.redis.get(sessionKey);
    if (!data) {
      const session = await this.kbDbService.getChatSessionById(sId);
      if (!session) {
        return null;
      }
      await this.putChatSessionDataToCache(session);
      return session;
    } else {
      const sessionData = JSON.parse(data) as ChatSession;
      sessionData._id = sId;
      sessionData.knowledgebaseId = new ObjectId(sessionData.knowledgebaseId);
      sessionData.userId = new ObjectId(sessionData.userId);
      return sessionData;
    }
  }

  private async setChatSessionData(data: ChatSession) {
    const sessionKey = `c_${data._id.toString()}`;
    data.updatedAt = new Date();
    await this.redis.set(
      sessionKey,
      JSON.stringify(data),
      'EX',
      CHAT_SESION_EXPIRY_TIME,
    );
  }

  async updateSessionDataWithNewMsg(
    session: ChatSession,
    msg: ChatQueryAnswer,
  ) {
    session.messages.push(msg);

    // Calculate total tokens based on the model used and update the monthly usage for user and kb
    const totalTokens = this.calculateTotalTokens(
      msg.qTokens,
      msg.aTokens,
      session.model,
    );

    return Promise.all([
      this.setChatSessionData(session),
      this.kbDbService.addMsgToChatSession(session._id, msg),
      this.userService.updateMonthlyUsageByN(
        session.userId,
        totalTokens,
        msg.qTokens + msg.aTokens,
      ),
      this.kbDbService.updateMonthlyUsageByN(
        session.knowledgebaseId,
        totalTokens,
        msg.qTokens + msg.aTokens,
      ),
    ]);
  }

  private async updateSessionDataWithNewManualMsg(
    session: ChatSession,
    msg: ChatQueryAnswer,
  ) {
    session.messages.push(msg);
    return Promise.all([
      this.setChatSessionData(session),
      this.kbDbService.addMsgToChatSession(session._id, msg),
    ]);
  }

  /**
   * Notify user of token limit exhaustion (at 80% and 100%)
   * Has logic to not notify only one time per user / month
   * @param userId
   * @returns
   */
  public async notifyUserOfTokenLimitExhaustion(userId: ObjectId) {
    //
    // Check from the usage if the token is 80% exceeded or 100% exceeded
    //

    const monthUsageData = await this.userService.getUserMonthlyUsageData(
      userId,
    );

    const subscriptionPlan = this.subPlanInfoService.getSubscriptionPlanInfo(
      monthUsageData.activeSubscription,
    );

    // We are sure that this function will be invoked only if the token
    // limit is exeeded for the current month, so no need of verifying
    // if the monthUsage.month is current month

    const maxTokens = subscriptionPlan.maxTokens;

    let emailSendFn: (email: string) => Promise<any>;
    let emailSendTaskName;

    if (monthUsageData.monthUsage.count >= maxTokens) {
      emailSendTaskName = `EMAIL_TOKEN_100_${userId}_${monthUsageData.monthUsage.month}`;
      emailSendFn = this.emailService.sendToken100ExhaustedEmail;
    } else if (monthUsageData.monthUsage.count >= 0.8 * maxTokens) {
      emailSendTaskName = `EMAIL_TOKEN_80_${userId}_${monthUsageData.monthUsage.month}`;
      emailSendFn = this.emailService.sendToken80ExhaustedEmail;
    }

    if (!(emailSendFn || emailSendTaskName)) return; // Something is wrong at the triggering side

    // Check if an email has already been sent to the user
    if ((await this.taskService.getTaskByName(emailSendTaskName)) !== null)
      return;

    // Send mail
    const user = await this.userService.findUserByIdSparse(
      userId.toHexString(),
    );
    console.log(`Sending mail to ${user.email}`);
    await emailSendFn(user.email);

    // Update task db to record that email has been sent
    await this.taskService.insertTask({
      name: emailSendTaskName,
      type: TaskType.EMAIL,
      payload: {
        userId: user._id,
        email: user.email,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async isUseUnderUsageLimits(
    userId: ObjectId,
    maxUsage: number,
    customKeys?: CustomKeyData,
  ): Promise<boolean> {
    // If there is a custom key configured for this knowledgebase
    // then by pass any token limit checks
    if (customKeys?.useOwnKey === true) {
      return true;
    }

    const monthUsageData = await this.userService.getUserMonthlyUsageData(
      userId,
    );

    // If monthUsage does not exists then this is the first msg ever - allow
    if (!monthUsageData.monthUsage) {
      return true;
    } else {
      const today = new Date();
      const currMonth = (today.getMonth() + 1).toString();
      const currYear = today.getFullYear().toString();

      const [month, year] = monthUsageData.monthUsage.month.split('/');

      // If the last monthusage was reported for current month and year
      // check the usage count
      if (year === currYear && month === currMonth) {
        if (monthUsageData.monthUsage.count >= 0.8 * maxUsage) {
          // Trigger notification to user about token limit
          const client = this.celeryClient.get(CeleryClientQueue.CRAWLER);
          const task = client.createTask('tasks.notify_token_limit');
          await task.applyAsync([userId.toHexString()]);
        }
        return monthUsageData.monthUsage.count < maxUsage;
      } else {
        // Else return true as this is the first call for current month
        return true;
      }
    }
  }

  /**
   * Get answer for chatbot question
   * @param sessionId
   * @param query
   * @returns
   */
  async getAnswer(sessionId: string, query: string, debug = false) {
    //
    // Checks and Validations
    //

    const sessionData = await this.getChatSessionDataFromCache(sessionId);
    if (!sessionData) {
      throw new HttpException('Invalid Session Id', HttpStatus.NOT_FOUND);
    }

    // Check usage limits for user
    const allowUsage = await this.isUseUnderUsageLimits(
      sessionData.userId,
      sessionData.subscriptionData.maxTokens,
      sessionData.customKeys,
    );
    if (!allowUsage) {
      const answer = 'Sorry I cannot respond right now';
      const msg = {
        id: uuidv4(),
        type: MessageType.BOT,
        q: query,
        a: answer,
        qTokens: 0,
        aTokens: 0,
        ts: new Date(),
        read: true,
        msg: null,
        sender: null,
        sessionId: sessionId,
      };
      await this.updateSessionDataWithNewMsg(sessionData, msg);
      return answer;
    }

    //
    // Get top N matching chunks for current query
    //

    const kbId = sessionData.knowledgebaseId;

    // Get top n chunks from knowledge base
    const topChunks = await this.openaiChatbotService.getTopNChunks(
      kbId,
      query,
      CHUNK_FILTER_THRESHOLD,
      sessionData.customKeys,
      sessionData.embeddingModel,
    );

    //
    // Get answer for query
    //

    // Get answer from chatgpt
    const prevMessages = sessionData.messages.slice(-2);

    const answer = await this.openaiChatbotService.getAiAnswer(
      sessionData.kbName,
      query,
      topChunks,
      prevMessages,
      sessionData.defaultAnswer,
      sessionData.prompt,
      sessionData.customKeys,
      sessionData.model,
      debug,
    );

    const msg = {
      id: uuidv4(),
      type: MessageType.BOT,
      q: query,
      a: answer.response,
      qTokens: answer.tokenUsage.prompt,
      aTokens: answer.tokenUsage.completion,
      ts: new Date(),
      read: true,
      msg: null,
      sender: null,
      sessionId: sessionId,
    };
    await this.updateSessionDataWithNewMsg(sessionData, msg);

    const sources = topChunks
      .filter((c) => c.score > SOURCES_FILTER_THRESHOLD)
      .map((c) => ({ url: c.url, title: c.title }));

    return {
      response: answer.response,
      sources,
      messages: answer.messages,
    };
  }

  async saveManualChat(sessionId: string, chatData: ChatQueryAnswer) {
    //
    // Checks and Validations
    //

    const sessionData = await this.getChatSessionDataFromCache(sessionId);
    if (!sessionData) {
      return null;
    }

    const msg = {
      id: uuidv4(),
      type: MessageType.MANUAL,
      q: null,
      a: null,
      qTokens: null,
      aTokens: null,
      ts: new Date(),
      msg: chatData.msg,
      sender: chatData.sender,
      sessionId: sessionId,
    };
    await this.updateSessionDataWithNewManualMsg(sessionData, msg);
    return sessionData.knowledgebaseId;
  }

  /**
   * Get chatbot answer as SSE stream
   * @param sessionId
   * @param query
   * @returns
   */
  async getAnswerStream(sessionId: string, query: string) {
    //
    // Checks and Validations
    //

    const sessionData = await this.getChatSessionDataFromCache(sessionId);
    if (!sessionData) {
      throw new HttpException('Invalid Session Id', HttpStatus.NOT_FOUND);
    }

    // Check usage limits for user
    const allowUsage = await this.isUseUnderUsageLimits(
      sessionData.userId,
      sessionData.subscriptionData.maxTokens,
      sessionData.customKeys,
    );
    const kbId = sessionData.knowledgebaseId;

    if (!allowUsage) {
      const answer = 'Sorry I cannot respond right now';
      const msg = {
        id: uuidv4(),
        type: MessageType.BOT,
        q: query,
        a: answer,
        qTokens: 0,
        aTokens: 0,
        ts: new Date(),
        read: true,
        msg: null,
        sender: null,
        sessionId: sessionId,
      };
      this.webSocketChatGateway.server
        .to(kbId.toHexString())
        .emit('chat_broadcast', msg);
      await this.updateSessionDataWithNewMsg(sessionData, msg);
      return of(answer);
    }

    //
    // Get top N matching chunks for current query
    //
    // Get top n chunks from knowledge base
    const topChunks = await this.openaiChatbotService.getTopNChunks(
      kbId,
      query,
      CHUNK_FILTER_THRESHOLD,
      sessionData.customKeys,
      sessionData.embeddingModel,
    );

    // Fetch previous messages from bot
    const prevMessages = this.getPreviousNMessagesFromBot(
      sessionData.messages,
      2,
    );

    //
    // Get answer for query
    //
    const answerStream = await this.openaiChatbotService.getAiAnswerStream(
      sessionData.kbName,
      query,
      topChunks,
      prevMessages,
      async (answer, usage) => {
        const msg = {
          id: uuidv4(),
          type: MessageType.BOT,
          q: query,
          a: answer,
          qTokens: usage.prompt,
          aTokens: usage.completion,
          ts: new Date(),
          read: true,
          msg: null,
          sender: null,
          sessionId: sessionId,
        };
        this.webSocketChatGateway.server
          .to(kbId.toHexString())
          .emit('chat_broadcast', msg);
        await this.updateSessionDataWithNewMsg(sessionData, msg);

        // Call webhook with msg
        this.webhookService.callWebhook(sessionData.userId, {
          event: WebhookEventType.CHATBOT_MSG,
          payload: {
            q: msg.q,
            a: msg.a,
            ts: msg.ts,
            session: {
              id: sessionData._id.toHexString(),
              kbName: sessionData.kbName,
              knowledgebaseId: sessionData.knowledgebaseId.toHexString(),
              src: sessionData.src,
              userData: sessionData.userData,
              startedAt: sessionData.startedAt,
              updatedAt: sessionData.updatedAt,
            },
          },
        });
      },
      sessionData.defaultAnswer,
      sessionData.prompt,
      sessionData.model,
      sessionData.customKeys,
    );

    const sources = topChunks
      .filter((c) => c.score > SOURCES_FILTER_THRESHOLD)
      .map((c) => ({ url: c.url, title: c.title }));

    // Transfer the stream into MessageEvent which is what sse wants
    return answerStream.pipe(
      map((value) => {
        const newVal: MessageEvent = {
          data: value,
        };

        return newVal;
      }),
      skipLast(1),
      endWith(
        {
          data: { content: '', sources },
        },
        '[DONE]',
      ),
    );
  }

  /**
   * Retrieves the previous N messages from the bot.
   *
   * @param messages - An array of ChatQueryAnswer objects representing the chat messages.
   * @param n - The maximum number of messages to retrieve.
   * @returns An array of ChatQueryAnswer objects representing the previous N messages from the bot.
   */
  getPreviousNMessagesFromBot(messages: ChatQueryAnswer[], n: number) {
    // if last message is of type 'MANUAL' or 'DIVIDER' then return empty array
    // else return the last Max(n, 0) continues messages of type 'BOT'
    const prevMessages = [];
    if (
      messages.length <= 0 ||
      messages[messages.length - 1].type !== MessageType.BOT
    ) {
      return prevMessages;
    }
    for (let i = messages.length - 1; i >= 0 && prevMessages.length < n; i--) {
      if (messages[i].type === MessageType.BOT) {
        prevMessages.unshift(messages[i]);
      } else {
        break;
      }
    }
    return prevMessages;
  }

  /**
   * Create a new chat session for a knowledgebase
   * @param knowledgebaseId
   * @returns
   */
  async createChatSession(
    knowledgebaseId: string,
    userData?: any,
    isAuthenticated = false,
    src?: string,
    slackThreadId?: string,
  ) {
    const sessionId = new ObjectId();

    let kbId: ObjectId;
    try {
      kbId = new ObjectId(knowledgebaseId);
    } catch {
      throw new HttpException('Invalid Knowledgebase Id', HttpStatus.NOT_FOUND);
    }

    // Check if knowledgebase id is valid
    const kb = await this.kbDbService.getKnowledgebaseById(kbId);
    if (!kb) {
      throw new HttpException('Invalid Knowledgebase Id', HttpStatus.NOT_FOUND);
    }

    // IF its a demo knowledgebase then the user should be authenticated
    // ie. Demo chatbots are not available to the public, but only to
    // authenticated users inside the app
    if (kb.isDemo && !isAuthenticated) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Check if knowledgebase is ready
    if (kb.status !== KnowledgebaseStatus.READY) {
      throw new HttpException(
        'Knowledgebase not ready!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get the subscription plan for the user to which the kb belongs
    const user = await this.userService.findUserById(kb.owner.toString());
    const subscriptionPlan = this.subPlanInfoService.getSubscriptionPlanInfo(
      user.activeSubscription,
    );

    // If there is a promptId associated with the KB, fetch the custom prompt
    const prompt = kb.prompt;

    const sessionData: ChatSession = {
      _id: sessionId,
      knowledgebaseId: kbId,
      slackThreadId: slackThreadId,
      kbName: `${kb.name} assistant`,
      defaultAnswer: kb.defaultAnswer,
      model: kb.model,
      prompt,
      isDemo: kb.isDemo,
      isManual: false,
      subscriptionData: subscriptionPlan,
      customKeys: user.customKeys,
      userId: kb.owner,
      startedAt: new Date(),
      updatedAt: new Date(),
      isUnread: true,
      messages: [],
      userData,
      src,
      ...(kb.embeddingModel && { embeddingModel: kb.embeddingModel }),
    };

    await Promise.all([
      this.setChatSessionData(sessionData),
      this.kbDbService.insertChatSession(sessionData),
    ]);

    const msgData = {
      id: uuidv4(),
      type: 'SYSTEM',
      ts: new Date(),
      msg: 'New session',
      sender: 'SYSTEM',
      sessionId: sessionId,
    };
    this.webSocketChatGateway.server
      .to(kbId.toHexString())
      .emit('new_session', msgData);

    return sessionId.toString();
  }

  /**
   * Switches the current chat session to either manual or automated mode based on the provided flag.
   * @param sessionId The unique identifier of the chat session to switch.
   * @param isManual A boolean flag indicating whether to switch the session to manual mode (true) or automated mode (false).
   */
  async switchChatSession(sessionId: string, isManual: boolean) {
    const sessionData = await this.getChatSessionDataFromCache(sessionId);

    if (!sessionData) return;

    const msg: ChatQueryAnswer = {
      id: uuidv4(),
      type: MessageType.DIVIDER,
      q: null,
      a: null,
      qTokens: 0,
      aTokens: 0,
      ts: new Date(),
      msg: isManual ? 'Chat with the Team' : 'Chat with the Bot',
      sender: null,
      sessionId: sessionId,
    };

    const updatedSessionData: ChatSession = {
      ...sessionData,
      isManual: isManual,
    };

    updatedSessionData.messages.push(msg);

    await Promise.all([
      this.setChatSessionData(updatedSessionData),
      this.kbDbService.updateChatSession(sessionData._id, updatedSessionData),
    ]);

    this.webSocketChatGateway.server
      .to(sessionData.knowledgebaseId.toHexString())
      .emit('chat_broadcast', msg);

    return sessionId;
  }

  async updateChatbotSession(sessionId: string, data: UpdateChatbotSessionDTO) {
    const sessionData = await this.getChatSessionDataFromCache(sessionId);

    if (!sessionData || !data.userData || !Object.keys(data.userData).length)
      return;

    const updatedSessionData: ChatSession = {
      ...sessionData,
      userData: {
        ...sessionData.userData,
        ...data.userData,
      },
    };

    await Promise.all([
      this.setChatSessionData(updatedSessionData),
      this.kbDbService.updateChatSession(sessionData._id, updatedSessionData),
    ]);
  }

  /**
   * API to test given propmpt
   * @param data
   * @returns
   */
  async testPrompt(data: PromptTestDTO) {
    return this.openaiChatbotService.getChatGptPrompt(
      data.chatbotName,
      data.query,
      data.context.map(
        (c) =>
          ({
            content: c,
            score: 0.9,
            url: 'http://test',
          } as any),
      ),
      data.prevMessages as any,
      data.defaultAnswer,
      data.prompt,
    );
  }

  /*********************************************************
   * CHAT SESSION APIS
   *********************************************************/

  /**
   * Get data for given chat session
   * @param user
   * @param sessionId
   * @returns
   */
  async getChatSessionData(user: UserSparse, sessionId: string) {
    const session: ChatSessionSparse =
      await this.kbDbService.getChatSessionSparseById(new ObjectId(sessionId));

    if (!session) {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }

    const kb = await this.kbDbService.getKnowledgebaseSparseById(
      session.knowledgebaseId,
    );

    checkUserPermissionForKb(user, kb, [UserPermissions.READ]);

    return session;
  }

  /**
   * Retrieves the chat session messages by session ID.
   * @param sessionId - The ID of the chat session.
   * @returns A Promise that resolves to a ChatSessionMessageSparse object.
   * @throws HttpException with status code HttpStatus.NOT_FOUND if the session ID is invalid or the session is not found.
   */
  async getChatSessionsMessagesById(
    sessionId: string,
  ): Promise<ChatSessionForWidget> {
    //validate sessionId
    let sessionObjId: ObjectId;
    try {
      sessionObjId = new ObjectId(sessionId);
    } catch {
      throw new HttpException('Invalid Session Id', HttpStatus.NOT_FOUND);
    }
    const session: ChatSessionMessageSparse =
      await this.kbDbService.getChatSessionSparseForWidgetById(sessionObjId);

    if (!session) {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }

    const transformedMessages: ChatMessageForWidget[] = [];
    session.messages.forEach((msg) => {
      if (msg.type === MessageType.BOT) {
        transformedMessages.push(
          {
            id: `${msg.id}-user`,
            role: 'user',
            content: msg.q,
            timestamp: msg.ts,
          },
          {
            id: `${msg.id}-bot`,
            role: 'bot',
            content: msg.a,
            timestamp: msg.ts,
          },
        );
      } else if (msg.type === MessageType.MANUAL) {
        transformedMessages.push({
          id: msg.id,
          role: msg.sender,
          content: msg.msg,
          timestamp: msg.ts,
        });
      } else if (msg.type === MessageType.DIVIDER) {
        transformedMessages.push({
          id: msg.id,
          role: 'divider',
          content: msg.msg,
          timestamp: msg.ts,
        });
      }
    });

    return {
      id: sessionId,
      messages: transformedMessages,
    };
  }

  async getChatSessionsForKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    pageSize: number,
    page?: number,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserPermissionForKb(user, kb, [UserPermissions.READ]);

    return this.kbDbService.getPaginatedChatSessionsForKnowledgebase(
      kbId,
      pageSize,
      page,
    );
  }

  /**
   * Remove session
   * @param sessionId
   */

  async deleteSessionBySession(user: UserSparse, sessionId: string) {
    const session: ChatSessionSparse =
      await this.kbDbService.getChatSessionSparseById(new ObjectId(sessionId));

    if (!session) {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }

    const kb = await this.kbDbService.getKnowledgebaseSparseById(
      session.knowledgebaseId,
    );

    checkUserPermissionForKb(user, kb, [UserPermissions.EDIT]);

    try {
      await this.kbDbService.deleteChatSession(new ObjectId(sessionId));
    } catch {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Mark all the messages in the Session as Read
   * @param sessionId
   */
  async markSessionAsRead(user: UserSparse, sessionId: string) {
    const session: ChatSessionSparse =
      await this.kbDbService.getChatSessionSparseById(new ObjectId(sessionId));

    if (!session) {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }

    const kb = await this.kbDbService.getKnowledgebaseSparseById(
      session.knowledgebaseId,
    );

    checkUserPermissionForKb(user, kb, [UserPermissions.EDIT]);

    try {
      this.kbDbService.updateChatSession(new ObjectId(sessionId), {
        isUnread: false,
      });
    } catch {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Mark all messages before the given msg as unread
   * @param sessionId
   * @param ts
   */
  async markSessionAsUnread(user: UserSparse, sessionId: string) {
    const session: ChatSessionSparse =
      await this.kbDbService.getChatSessionSparseById(new ObjectId(sessionId));

    if (!session) {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }

    const kb = await this.kbDbService.getKnowledgebaseSparseById(
      session.knowledgebaseId,
    );

    checkUserPermissionForKb(user, kb, [UserPermissions.EDIT]);

    try {
      this.kbDbService.updateChatSession(new ObjectId(sessionId), {
        isUnread: true,
      });
    } catch {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Set Feedback for Chat Session Msg by Msg Idx
   * @param sessionId
   * @param msgIdx
   * @param feedback
   */
  async setSessionMessageFeedback(
    sessionId: string,
    msgIdx: number,
    feedback: ChatAnswerFeedbackType,
  ) {
    try {
      await this.kbDbService.setChatSessionMessageFeedback(
        new ObjectId(sessionId),
        msgIdx,
        feedback,
      );
    } catch {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Calculates the total number of tokens based on the number of question tokens, answer tokens, and the model.
   *
   * Input token usage ratio for gpt-3.5 : gpt-4 : gpt-4-turbo = 1 : 60 : 20
   * Output token usage ratio for gpt-3.5 : gpt-4 : gpt-4-turbo = 1 : 40 : 20
   *
   * @param qTokens The number of question tokens.
   * @param aTokens The number of answer tokens.
   * @param model The model used for token calculation.
   * @returns The total number of tokens.
   */
  calculateTotalTokens(qTokens: number, aTokens: number, model: string) {
    switch (model) {
      case 'gpt-4-0613': // GPT-4
        return qTokens * 60 + aTokens * 40;
      case 'gpt-4-turbo-preview': // GPT-4-Turbo
        return qTokens * 20 + aTokens * 20;
      default:
        return qTokens + aTokens;
    }
  }
}

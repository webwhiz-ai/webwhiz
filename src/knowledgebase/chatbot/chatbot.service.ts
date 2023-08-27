import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  MessageEvent,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { ObjectId } from 'mongodb';
import { endWith, map, of, skipLast } from 'rxjs';
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
import { checkUserIsOwnerOfKb } from '../knowledgebase-utils';
import {
  ChatQueryAnswer,
  ChatSession,
  ChatSessionSparse,
  CustomKeyData,
  KnowledgebaseStatus,
} from '../knowledgebase.schema';
import { PromptTestDTO, UpdateChatbotSessionDTO } from './chatbot.dto';
import { OpenaiChatbotService } from './openaiChatbotService';

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
  ) {}

  private async putChatSessionDataToCache(sessionData: ChatSession) {
    return this.redis.set(
      `c_${sessionData._id}`,
      JSON.stringify(sessionData),
      'EX',
      CHAT_SESION_EXPIRY_TIME,
    );
  }

  private async getChatSessionDataFromCache(sessionId: string) {
    const sessionKey = `c_${sessionId}`;
    const sId = new ObjectId(sessionId);
    const data = await this.redis.get(sessionKey);
    if (!data) {
      const session = await this.kbDbService.getChatSessionById(sId);
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

  private async updateSessionDataWithNewMsg(
    session: ChatSession,
    msg: ChatQueryAnswer,
  ) {
    session.messages.push(msg);
    const totalTokens = msg.qTokens + msg.aTokens;
    return Promise.all([
      this.setChatSessionData(session),
      this.kbDbService.addMsgToChatSession(session._id, msg),
      this.userService.updateMonthlyUsageByN(session.userId, totalTokens),
      this.kbDbService.updateMonthlyUsageByN(
        session.knowledgebaseId,
        totalTokens,
      ),
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
        q: query,
        a: answer,
        qTokens: 0,
        aTokens: 0,
        ts: new Date(),
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
      debug,
    );

    const msg = {
      q: query,
      a: answer.response,
      qTokens: answer.tokenUsage.prompt,
      aTokens: answer.tokenUsage.completion,
      ts: new Date(),
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
    if (!allowUsage) {
      const answer = 'Sorry I cannot respond right now';
      const msg = {
        q: query,
        a: answer,
        qTokens: 0,
        aTokens: 0,
        ts: new Date(),
      };
      await this.updateSessionDataWithNewMsg(sessionData, msg);
      return of(answer);
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
    );

    //
    // Get answer for query
    //

    // Get answer from chatgpt
    const prevMessages = sessionData.messages.slice(-2);

    const answerStream = await this.openaiChatbotService.getAiAnswerStream(
      sessionData.kbName,
      query,
      topChunks,
      prevMessages,
      async (answer, usage) => {
        const msg = {
          q: query,
          a: answer,
          qTokens: usage.prompt,
          aTokens: usage.completion,
          ts: new Date(),
        };
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
   * Create a new chat session for a knowledgebase
   * @param knowledgebaseId
   * @returns
   */
  async createChatSession(
    knowledgebaseId: string,
    userData?: any,
    isAuthenticated = false,
    src?: string,
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
    // ie. Demo chatbots are not avialable to the public, but only to
    // authenticated users inside the app
    if (kb.isDemo && !isAuthenticated) {
      throw new HttpException('Unauthorised', HttpStatus.UNAUTHORIZED);
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
      kbName: `${kb.name} assistant`,
      defaultAnswer: kb.defaultAnswer,
      prompt,
      isDemo: kb.isDemo,
      subscriptionData: subscriptionPlan,
      customKeys: user.customKeys,
      userId: kb.owner,
      startedAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      userData,
      src,
    };

    await Promise.all([
      this.setChatSessionData(sessionData),
      this.kbDbService.insertChatSession(sessionData),
    ]);

    return sessionId.toString();
  }

  async updateChatbotSession(sessionId: string, data: UpdateChatbotSessionDTO) {
    const sessionData = await this.getChatSessionDataFromCache(sessionId);

    if (!(data.userData || Object.keys(data.userData).length)) return;

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

    if (!user._id.equals(kb.owner)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return session;
  }

  async getChatSessionsForKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    pageSize: number,
    page?: number,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    return this.kbDbService.getPaginatedChatSessionsForKnowledgebase(
      kbId,
      pageSize,
      page,
    );
  }
}

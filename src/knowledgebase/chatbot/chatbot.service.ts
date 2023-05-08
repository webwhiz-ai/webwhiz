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
import { REDIS } from '../../common/redis/redis.module';
import { SubscriptionPlanInfoService } from '../../subscription/subscription-plan.service';
import { UserSparse } from '../../user/user.schema';
import { UserService } from '../../user/user.service';
import {
  ChatQueryAnswer,
  ChatSession,
  KnowledgebaseStatus,
} from '../knowledgebase.schema';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import { OpenaiChatbotService } from './openaiChatbotService';
import { checkUserIsOwnerOfKb } from '../knowledgebase-utils';
import { PromptTestDTO } from './chatbot.dto';
import { PromptService } from '../prompt/prompt.service';

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
    private promptService: PromptService,
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

  private async isUseUnderUsageLimits(
    userId: ObjectId,
    maxUsage: number,
  ): Promise<boolean> {
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
    const sessionData = await this.getChatSessionDataFromCache(sessionId);
    if (!sessionData) {
      throw new HttpException('Invalid Session Id', HttpStatus.NOT_FOUND);
    }

    // Check usage limits for user
    const allowUsage = await this.isUseUnderUsageLimits(
      sessionData.userId,
      sessionData.subscriptionData.maxTokens,
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

    const kbId = sessionData.knowledgebaseId;

    // Get top n chunks from knowledge base
    const topChunks = await this.openaiChatbotService.getTopNChunks(
      kbId,
      query,
      CHUNK_FILTER_THRESHOLD,
    );

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
      },
      sessionData.defaultAnswer,
      sessionData.prompt,
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
    const user = await this.userService.findUserByIdSparse(kb.owner.toString());
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
      userId: kb.owner,
      startedAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      userData,
      src,
    };

    await Promise.all([
      this.redis.set(
        `c_${sessionId}`,
        JSON.stringify(sessionData),
        'EX',
        CHAT_SESION_EXPIRY_TIME,
      ),
      this.kbDbService.insertChatSession(sessionData),
    ]);

    return sessionId.toString();
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
    let session;

    try {
      session = await this.kbDbService.getChatSessionById(
        new ObjectId(sessionId),
      );
    } catch {
      throw new HttpException('Invalid Session', HttpStatus.NOT_FOUND);
    }

    const kb = await this.kbDbService.getKnowledgebaseById(
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

    const kb = await this.kbDbService.getKnowledgebaseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    return this.kbDbService.getPaginatedChatSessionsForKnowledgebase(
      kbId,
      pageSize,
      page,
    );
  }
}

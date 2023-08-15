import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { isAdmin } from '../auth/guards/role.enum';
import {
  CeleryClientQueue,
  CeleryClientService,
  CELERY_CLIENT,
} from '../common/celery/celery-client.module';
import { CrawlConfig } from '../importers/crawler/crawlee/crawler.types';
import { SubscriptionPlanInfoService } from '../subscription/subscription-plan.service';
import { SubscriptionPlanInfo } from '../subscription/subscription.const';
import { UserSparse } from '../user/user.schema';
import { KnowledgebaseDbService } from './knowledgebase-db.service';
import { checkUserIsOwnerOfKb } from './knowledgebase-utils';
import {
  CreateKnowledgebaseDTO,
  UpdateKnowledgebaseWebsiteDataDTO,
} from './knowledgebase.dto';
import {
  DataStoreType,
  Knowledgebase,
  KnowledgebaseStatus,
} from './knowledgebase.schema';
import { PromptService } from './prompt/prompt.service';
import { DEFAULT_CHATGPT_PROMPT } from './chatbot/openaiChatbot.constant';

@Injectable()
export class KnowledgebaseService {
  constructor(
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
    private kbDbService: KnowledgebaseDbService,
    private subPlanInfoService: SubscriptionPlanInfoService,
    private promptService: PromptService,
  ) {}

  /*********************************************************
   * KNOWLEDGEBASE CREATION AND CRAWLING
   *********************************************************/

  private async crawlWebsiteForKb(
    kbId: ObjectId,
    websiteData: Knowledgebase['websiteData'],
    maxPages: number,
    useAlternateParser = false,
  ) {
    const baseUrl = new URL(websiteData.websiteUrl).origin;

    const includeUrlsForInit = websiteData.include.map((u) => `${baseUrl}${u}`);

    const data: CrawlConfig = {
      urls: [
        websiteData.websiteUrl,
        ...websiteData.urls,
        ...includeUrlsForInit,
      ],
      include: websiteData.include.flatMap((u) => [
        `${baseUrl}${u}`,
        `${baseUrl}${u}/**/*`,
      ]),
      exclude: websiteData.exclude.flatMap((u) => [
        `${baseUrl}${u}`,
        `${baseUrl}${u}/**/*`,
      ]),
      maxPages,
    };

    // Exclude other file types
    data.exclude.push(`${baseUrl}/**/*.mp3`);

    const client = this.celeryClient.get(CeleryClientQueue.CRAWLER);
    const task = client.createTask('tasks.crawl');
    await task.applyAsync([data, kbId.toString(), 1, useAlternateParser]);

    await this.kbDbService.updateKnowledgebaseStatus(
      kbId,
      KnowledgebaseStatus.CRAWLING,
    );
  }

  /**
   * Clean website data urls
   * - websiteUrl, urls: This should be a valid url and should not have trailing /
   * - include, exclude: This should being with a slash
   * @param data
   * @returns
   */
  public cleanWebsiteData(
    data: Knowledgebase['websiteData'],
  ): Knowledgebase['websiteData'] {
    function validateUrl(url: string): string {
      if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        throw new HttpException(`Invalid Url ${url}`, HttpStatus.BAD_REQUEST);
      }

      // Remove any trailing slashes
      url = url.replace(/\/+$/, '');

      return url;
    }

    function validatePath(path: string): string {
      // Ensure / in the beginning
      if (path[0] !== '/') {
        path = '/' + path;
      }

      // Remove any slashes at the end
      path = path.replace(/\/+$/, '');

      return path;
    }

    // Ensure website url and urls is well formed
    data.websiteUrl = validateUrl(data.websiteUrl);
    data.urls = data.urls.map(validateUrl);

    data.include = data.include.map(validatePath);
    data.exclude = data.exclude.map(validatePath);

    return data;
  }

  /**
   * Create a new knowledgebase and crawl urls
   * @param user
   * @param data
   * @returns
   */
  async createKnowledgebase(user: UserSparse, data: CreateKnowledgebaseDTO) {
    // Check how many kbs user currently has
    const kbCount = await this.kbDbService.getKnowledgebaseCountForUser(
      user._id,
    );
    const subscriptionData = this.getUserSubscriptionData(user);
    if (kbCount >= subscriptionData.maxChatbots) {
      throw new HttpException(
        'Max Knowledgebase count reached for user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const websiteData: Knowledgebase['websiteData'] = this.cleanWebsiteData({
      websiteUrl: data.websiteUrl,
      urls: data.urls,
      include: data.include,
      exclude: data.exclude,
    });

    // Create a new Kb in db
    const ts = new Date();
    const kb: Knowledgebase = {
      name: data.name,
      owner: user._id,
      status: KnowledgebaseStatus.CREATED,
      websiteData,
      createdAt: ts,
      updatedAt: ts,
    };
    const kbData = await this.kbDbService.insertKnowledgebase(kb);

    // Start crawling
    const maxPages = isAdmin(user) ? 2000 : subscriptionData.maxPages;
    await this.crawlWebsiteForKb(
      kbData._id,
      websiteData,
      maxPages,
      data.useAlternateParser,
    );

    return kbData;
  }

  /**
   * Update website data urls for Knowledgebase and recrawl
   * @param user
   * @param data
   * @returns
   */
  async updateKnowledgebaseWebsiteData(
    user: UserSparse,
    id: string,
    data: UpdateKnowledgebaseWebsiteDataDTO,
  ) {
    const kbId = new ObjectId(id);
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    if (
      kb.status === KnowledgebaseStatus.CRAWLING ||
      kb.status === KnowledgebaseStatus.GENERATING_EMBEDDINGS
    ) {
      throw new HttpException(
        'Knowledgebase already in training',
        HttpStatus.BAD_REQUEST,
      );
    }

    const subscriptionData = this.getUserSubscriptionData(user);

    const websiteData: Knowledgebase['websiteData'] = this.cleanWebsiteData({
      websiteUrl: data.websiteUrl,
      urls: data.urls,
      include: data.include,
      exclude: data.exclude,
    });

    // Delete all exiting chunks and embeddings
    await Promise.all([
      this.kbDbService.deleteKbDataStoreItemsForKnowledgebase(
        kbId,
        DataStoreType.WEBPAGE,
      ),
      this.kbDbService.deleteChunksForKnowledgebase(
        kbId,
        DataStoreType.WEBPAGE,
      ),
      this.kbDbService.deleteKbEmbeddingsForKnowledgebase(
        kbId,
        DataStoreType.WEBPAGE,
      ),
    ]);

    const updateData: Partial<Knowledgebase> = {
      status: KnowledgebaseStatus.CREATED,
      websiteData,
    };

    // Update data in db
    await this.kbDbService.updateKnowledgebase(kbId, updateData);

    const updatedData = { ...kb, ...updateData };

    // Start crawling
    const maxPages = isAdmin(user) ? 2000 : subscriptionData.maxPages;
    await this.crawlWebsiteForKb(
      kbId,
      websiteData,
      maxPages,
      data.useAlternateParser,
    );

    return updatedData;
  }

  /**
   * Start generating embeddings for Knowledgebase
   * @param user
   * @param id
   */
  async generateEmbeddingsForKnowledgebase(user: UserSparse, id: string) {
    const kbId = new ObjectId(id);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    if (
      kb.status === KnowledgebaseStatus.CRAWLING ||
      kb.status === KnowledgebaseStatus.GENERATING_EMBEDDINGS
    ) {
      throw new HttpException(
        'Knowledgebase already in training',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.kbDbService.updateKnowledgebaseStatus(
      kbId,
      KnowledgebaseStatus.GENERATING_EMBEDDINGS,
    );

    const client = this.celeryClient.get(CeleryClientQueue.CRAWLER);
    const task = client.createTask('tasks.gen_embeddings');
    await task.applyAsync([kbId.toString()]);
  }

  /*********************************************************
   * KNOWLEDGEBASE APIS
   *********************************************************/

  private getUserSubscriptionData(user: UserSparse): SubscriptionPlanInfo {
    const userPlan = user.activeSubscription;
    return this.subPlanInfoService.getSubscriptionPlanInfo(userPlan);
  }

  private getBaseSystemMsgFromPrompt(prompt: string): string {
    try {
      const promptJson = JSON.parse(prompt);
      const systemMsg = promptJson[0].content;
      const baseMsg = systemMsg.split('\n\nContext Sections')[0];
      return baseMsg;
    } catch {
      return undefined;
    }
  }

  private constructPromptFromBaseSystemMsg(msg: string): string {
    const prompt = JSON.parse(DEFAULT_CHATGPT_PROMPT);
    const baseMsg: string[] = prompt[0].content.split('\n\nContext Sections');
    baseMsg[0] = msg;
    prompt[0].content = baseMsg.join('\n\nContext Sections');
    return JSON.stringify(prompt);
  }

  /**
   * Get all knowledgebases for user
   * @param user
   * @returns
   */
  async listKnowledgebasesForUser(user: UserSparse) {
    return this.kbDbService.getKnowledgesbaseListForUser(user._id);
  }

  /**
   * Get knowledgebase detail data
   * @param user
   * @param id
   * @returns
   */
  async getKnowledgeBaseDetail(user: UserSparse, id: string) {
    const kb = await this.kbDbService.getKnowledgebaseById(new ObjectId(id));
    checkUserIsOwnerOfKb(user, kb);

    // Set Default prompt if knowledgebase prompt is not defined
    if (!kb.prompt) {
      kb.prompt = DEFAULT_CHATGPT_PROMPT;
    }

    kb.prompt = this.getBaseSystemMsgFromPrompt(kb.prompt);

    return kb;
  }

  /**
   * Admin API to set Knowledgebase as a Demo KB
   * @param kbId
   */
  async setKnowledgebaseAsDemo(user: UserSparse, knowledgebaseId: string) {
    const kbId = new ObjectId(knowledgebaseId);

    // Update the knowledgebase (also verify that the kb belongs to the admin user)
    const res = await this.kbDbService.updateKnowledgebase(kbId, {
      isDemo: true,
    });

    if (res.modifiedCount === 0) {
      throw new HttpException('Invalid Knowledgebase', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Delete knowledgebase and all its data
   * @param user
   * @param id
   */
  async deleteKnowledgebaseForUser(user: UserSparse, id: string) {
    const kbId = new ObjectId(id);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    await Promise.all([
      this.kbDbService.deleteKnowledgebase(kbId),
      this.kbDbService.deleteKbDataStoreItemsForKnowledgebase(kbId),
      this.kbDbService.deleteChunksForKnowledgebase(kbId),
      this.kbDbService.deleteKbEmbeddingsForKnowledgebase(kbId),
    ]);
  }

  /**
   * Set chat widge data for Knowledgebase
   * @param user
   * @param id
   * @param data
   */
  async setKnowledgebaseChatWidgeData(user: UserSparse, id: string, data: any) {
    const kbId = new ObjectId(id);
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    await this.kbDbService.setKnowledgebaseChatWidgetData(kbId, data);
  }

  /**
   * Get Chat widget data for Knowledgebase
   * @param id kk
   * @returns
   */
  async getKnowledgebaseChatWidgetData(id: string) {
    let kbId: ObjectId;
    try {
      kbId = new ObjectId(id);
    } catch {
      throw new HttpException('Invalid Knowledgebase Id', HttpStatus.NOT_FOUND);
    }

    const widgetData = await this.kbDbService.getKnowledgebaseChatWidgetData(
      kbId,
    );

    return widgetData;
  }

  /**
   * Set / Unset the defaultAnswer for the knowledgebase
   * @param user
   * @param id
   * @param defaultAnswer
   * @returns
   */
  async setKnowledgebaseDefaultAnswer(
    user: UserSparse,
    id: string,
    defaultAnswer?: string,
  ) {
    const kbId = new ObjectId(id);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    await this.kbDbService.updateKnowledgebase(kbId, {
      defaultAnswer,
    });
  }

  async setKnowledgebasePrompt(user: UserSparse, id: string, prompt: string) {
    const kbId = new ObjectId(id);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    prompt = this.constructPromptFromBaseSystemMsg(prompt);

    await this.kbDbService.updateKnowledgebase(kbId, {
      prompt,
    });

    return 'Done';
  }
}

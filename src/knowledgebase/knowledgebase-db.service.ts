import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db, FindCursor, ObjectId, WithId } from 'mongodb';
import { MONGODB } from '../common/mongo/mongo.module';
import { getLimitOffsetPaginatedResponse } from '../common/utils';
import {
  ChatQueryAnswer,
  ChatSession,
  CHAT_SESSION_COLLECTION,
  Chunk,
  ChunkStatus,
  CHUNK_COLLECTION,
  DataStoreStatus,
  DataStoreType,
  KbDataStore,
  KbEmbedding,
  KB_DATASTORE_COLLECTION,
  KB_EMBEDDING_COLLECTION,
  Knowledgebase,
  KnowledgebaseSparse,
  KnowledgebaseStatus,
  KNOWLEDGEBASE_COLLECTION,
  Prompt,
  PROMPT_COLLECTION,
  ChatSessionSparse,
  ChatAnswerFeedbackType,
} from './knowledgebase.schema';

@Injectable()
export class KnowledgebaseDbService {
  private readonly knowledgebaseCollection: Collection<Knowledgebase>;
  private readonly kbDataStoreCollection: Collection<KbDataStore>;
  private readonly chunkColleciton: Collection<Chunk>;
  private readonly kbEmbeddingCollection: Collection<KbEmbedding>;
  private readonly chatSessionCollection: Collection<ChatSession>;
  private readonly promptCollection: Collection<Prompt>;

  constructor(@Inject(MONGODB) private db: Db) {
    this.knowledgebaseCollection = this.db.collection<Knowledgebase>(
      KNOWLEDGEBASE_COLLECTION,
    );
    this.kbDataStoreCollection = this.db.collection<KbDataStore>(
      KB_DATASTORE_COLLECTION,
    );
    this.chunkColleciton = this.db.collection<Chunk>(CHUNK_COLLECTION);
    this.kbEmbeddingCollection = this.db.collection<KbEmbedding>(
      KB_EMBEDDING_COLLECTION,
    );
    this.chatSessionCollection = this.db.collection<ChatSession>(
      CHAT_SESSION_COLLECTION,
    );
    this.promptCollection = this.db.collection<Prompt>(PROMPT_COLLECTION);
  }

  /*********************************************************
   * KNOWLEDGEBASE COLLECTION
   *********************************************************/

  async insertKnowledgebase(data: Knowledgebase): Promise<Knowledgebase> {
    const res = await this.knowledgebaseCollection.insertOne(data);

    return {
      _id: res.insertedId,
      ...data,
    };
  }

  async getKnowledgebaseSparseById(id: ObjectId): Promise<KnowledgebaseSparse> {
    const res = await this.knowledgebaseCollection.findOne(
      { _id: id },
      {
        projection: {
          _id: 1,
          name: 1,
          status: 1,
          monthUsage: 1,
          crawlData: 1,
          owner: 1,
        },
      },
    );
    return res as KnowledgebaseSparse;
  }

  async getKnowledgebaseSparseByDomain(
    domain: string,
  ): Promise<KnowledgebaseSparse> {
    const res = await this.knowledgebaseCollection.findOne(
      { customDomain: domain },
      {
        projection: {
          _id: 1,
          name: 1,
          status: 1,
          monthUsage: 1,
          crawlData: 1,
          owner: 1,
        },
      },
    );
    return res as KnowledgebaseSparse;
  }

  async getKnowledgebaseById(id: ObjectId): Promise<Knowledgebase> {
    const res = await this.knowledgebaseCollection.findOne({ _id: id });
    return res;
  }

  async getKnowledgebaseCountForUser(userId: ObjectId) {
    const kbCount = await this.knowledgebaseCollection.countDocuments({
      owner: userId,
    });
    return kbCount;
  }

  async getKnowledgesbaseListForUser(
    userId: ObjectId,
  ): Promise<KnowledgebaseSparse[]> {
    const kbs = await this.knowledgebaseCollection
      .find({ owner: userId })
      .project({
        _id: 1,
        name: 1,
        status: 1,
        monthUsage: 1,
        'crawlData.stats': 1,
        owner: 1,
      })
      .toArray();
    return kbs as KnowledgebaseSparse[];
  }

  async getKnowledgebaseChatWidgetData(id: ObjectId) {
    const widgetData = await this.knowledgebaseCollection.findOne(
      { _id: id },
      { projection: { chatWidgeData: 1 } },
    );

    return widgetData;
  }

  async updateKnowledgebaseStatus(id: ObjectId, status: KnowledgebaseStatus) {
    await this.knowledgebaseCollection.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } },
    );
  }

  async updateKnowledgebase(id: ObjectId, update: Partial<Knowledgebase>) {
    return this.knowledgebaseCollection.updateOne(
      { _id: id },
      { $set: { ...update, updatedAt: new Date() } },
    );
  }

  async setKnowledgebaseCrawlData(
    id: ObjectId,
    crawlData: Knowledgebase['crawlData'],
    status?: KnowledgebaseStatus,
  ) {
    const update: any = { crawlData, updatedAt: new Date() };
    if (status) {
      update.status = status;
    }
    await this.knowledgebaseCollection.updateOne({ _id: id }, { $set: update });
  }

  async setKnowledgebaseChatWidgetData(
    id: ObjectId,
    widgetData: Knowledgebase['chatWidgeData'],
  ) {
    await this.knowledgebaseCollection.updateOne(
      { _id: id },
      { $set: { chatWidgeData: widgetData, updatedAt: new Date() } },
    );
  }

  async updateMonthlyUsageByN(kbId: ObjectId, n: number) {
    await this.knowledgebaseCollection.updateOne({ _id: kbId }, [
      {
        $set: {
          monthUsage: {
            $cond: {
              if: {
                $eq: [
                  '$monthUsage.month',
                  {
                    $concat: [
                      {
                        $toString: new Date().getMonth() + 1,
                      },
                      '/',
                      {
                        $toString: new Date().getFullYear(),
                      },
                    ],
                  },
                ],
              },
              then: {
                month: '$monthUsage.month',
                count: { $add: ['$monthUsage.count', n] },
              },
              else: {
                month: {
                  $concat: [
                    {
                      $toString: new Date().getMonth() + 1,
                    },
                    '/',
                    {
                      $toString: new Date().getFullYear(),
                    },
                  ],
                },
                count: n,
              },
            },
          },
        },
      },
    ]);
  }

  async deleteKnowledgebase(id: ObjectId) {
    await this.knowledgebaseCollection.deleteOne({ _id: id });
  }

  /*********************************************************
   * KNOWLEDGEBASE DATA STORE
   *********************************************************/

  async insertToKbDataStore(data: KbDataStore) {
    const res = await this.kbDataStoreCollection.insertOne(data);
    return {
      _id: res.insertedId,
      ...data,
    };
  }

  async getKbDataStoreItemById(id: ObjectId) {
    return this.kbDataStoreCollection.findOne({ _id: id });
  }

  /**
   * Get cursor for datastore items for given knowledgebase
   * @param kbId
   * @returns
   */
  getKbDataStoreItemsForKnowledgebase(
    kbId: ObjectId,
    status?: DataStoreStatus[],
  ) {
    const filter: any = {
      knowledgebaseId: kbId,
    };
    if (status) {
      filter.status = { $in: status };
    }
    return this.kbDataStoreCollection.find(filter);
  }

  async getPaginatedDataStoreItemsForKnowledgebase(
    kbId: ObjectId,
    pageSize: number,
    type?: DataStoreType,
    page?: number,
  ) {
    const itemsPerPage = Math.min(pageSize, 100);

    const projectionFields = {
      _id: 1,
      url: 1,
      title: 1,
      type: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    };
    type DataStoreListType = Pick<
      KbDataStore,
      '_id' | 'url' | 'title' | 'type' | 'status' | 'createdAt' | 'updatedAt'
    >;

    const filterFields: any = { knowledgebaseId: kbId };
    if (type) {
      filterFields.type = type;
    }

    const response = await getLimitOffsetPaginatedResponse<DataStoreListType>(
      this.kbDataStoreCollection,
      filterFields,
      projectionFields,
      '_id',
      1,
      itemsPerPage,
      page,
    );

    return response;
  }

  async updateKbDataStoreItem(id: ObjectId, data: Partial<KbDataStore>) {
    delete data._id;
    data.updatedAt = new Date();
    await this.kbDataStoreCollection.updateOne({ _id: id }, { $set: data });
    return {
      _id: id,
      ...data,
    };
  }

  async deleteKbDataStoreItem(id: ObjectId) {
    await this.kbDataStoreCollection.deleteOne({ _id: id });
  }

  async deleteKbDataStoreItemsForKnowledgebase(
    kbId: ObjectId,
    type?: DataStoreType,
  ) {
    const filter: any = { knowledgebaseId: kbId };
    if (type) filter.type = type;
    await this.kbDataStoreCollection.deleteMany(filter);
  }

  /*********************************************************
   * KNOWLEDGEBASE CHUNK COLLECTION
   *********************************************************/

  async insertChunk(data: Chunk): Promise<Chunk> {
    const res = await this.chunkColleciton.insertOne(data);

    return {
      _id: res.insertedId,
      ...data,
    };
  }

  async insertChunksBulk(data: Chunk[]): Promise<ObjectId[]> {
    const res = await this.chunkColleciton.insertMany(data);
    return Object.values(res.insertedIds);
  }

  getChunksForKnowledgebase(
    knowledgebaseId: ObjectId,
    status?: ChunkStatus,
  ): FindCursor<WithId<Chunk>> {
    const filter: any = { knowledgebaseId };
    if (status) {
      filter.status = status;
    }
    const chunks = this.chunkColleciton.find(filter);
    return chunks;
  }

  async getChunkByIdBulk(ids: ObjectId[]) {
    const chunks = this.chunkColleciton.find({ _id: { $in: ids } }).toArray();
    return chunks;
  }

  async getChunksForDataStoreItem(dId: ObjectId) {
    const res: Pick<Chunk, '_id'>[] = await this.chunkColleciton
      .find({ dataStoreId: dId }, { projection: { _id: 1 } })
      .toArray();
    return res;
  }

  async updateChunkById(id: ObjectId, chunk: Partial<Chunk>) {
    delete chunk._id;
    await this.chunkColleciton.updateOne(
      { _id: id },
      { $set: { ...chunk, updatedAt: new Date() } },
    );
  }

  async deleteChunkInKnowledgebase(
    knowledgebaseId: ObjectId,
    chunkId: ObjectId,
  ) {
    await this.chunkColleciton.deleteOne({
      _id: chunkId,
      knowledgebaseId: knowledgebaseId,
    });
  }

  async deleteChunksByIdBulk(ids: ObjectId[]) {
    await this.chunkColleciton.deleteMany({ _id: { $in: ids } });
  }

  async deleteChunksForKnowledgebase(id: ObjectId, type?: DataStoreType) {
    const filter: any = { knowledgebaseId: id };
    if (type) filter.type = type;
    await this.chunkColleciton.deleteMany(filter);
  }

  /*********************************************************
   * KNOWLEDGEBASE EMBEDDING COLLECTION
   *********************************************************/

  async insertEmbeddingForChunk(data: KbEmbedding) {
    const res = await this.kbEmbeddingCollection.insertOne(data);

    return {
      _id: res.insertedId,
      ...data,
    };
  }

  /**
   * Update embeedding for chunk in embeddings for KB
   * @param knowledgebaseId
   * @param embedding
   */
  async updateEmbeddingForChunk(chunkId: ObjectId, embeddings: number[]) {
    await this.kbEmbeddingCollection.updateOne(
      {
        _id: chunkId,
      },
      { $set: { embeddings } },
    );
  }

  async deleteKbEmbeddingsForKnowledgebase(
    kbId: ObjectId,
    type?: DataStoreType,
  ) {
    const filter: any = { knowledgebaseId: kbId };
    if (type) filter.type = type;
    await this.kbEmbeddingCollection.deleteMany(filter);
  }

  async deleteEmbeddingForChunk(chunkId: ObjectId) {
    await this.kbEmbeddingCollection.deleteOne({
      _id: chunkId,
    });
  }

  async deleteEmbeddingsByIdBulk(ids: ObjectId[]) {
    await this.kbEmbeddingCollection.deleteMany({ _id: { $in: ids } });
  }

  /*********************************************************
   * CHAT SESSION COLLECTION
   *********************************************************/

  async insertChatSession(data: ChatSession) {
    const res = await this.chatSessionCollection.insertOne(data);

    return {
      _id: res.insertedId,
      ...data,
    };
  }

  async getChatSessionById(id: ObjectId): Promise<ChatSession> {
    const session = await this.chatSessionCollection.findOne({ _id: id });
    return session;
  }

  async getChatSessionSparseById(id: ObjectId): Promise<ChatSessionSparse> {
    const session = await this.chatSessionCollection.findOne(
      { _id: id },
      {
        projection: {
          _id: 1,
          src: 1,
          messages: 1,
          userData: 1,
          startedAt: 1,
          updatedAt: 1,
          knowledgebaseId: 1,
        },
      },
    );
    return session;
  }

  async getPaginatedChatSessionsForKnowledgebase(
    kbId: ObjectId,
    pageSize: number,
    page?: number,
  ) {
    const itemsPerPage = Math.min(pageSize, 50);

    const projectionFields = {
      _id: 1,
      startedAt: 1,
      updatedAt: 1,
      userData: 1,
      isUnread: 1,
      firstMessage: { $first: '$messages' },
    };

    const filter = {
      knowledgebaseId: kbId,
    };

    const response = await getLimitOffsetPaginatedResponse(
      this.chatSessionCollection,
      filter,
      projectionFields,
      '_id',
      -1,
      itemsPerPage,
      page,
    );

    return response;
  }

  async addMsgToChatSession(id: ObjectId, msg: ChatQueryAnswer) {
    await this.chatSessionCollection.updateOne(
      { _id: id },
      { $push: { messages: msg }, $set: { updatedAt: new Date(), read: true } },
    );
  }

  async updateChatSession(id: ObjectId, session: Partial<ChatSession>) {
    await this.chatSessionCollection.updateOne(
      {
        _id: id,
      },
      { $set: session },
    );
  }

  async setChatSessionMessageFeedback(
    id: ObjectId,
    msgIdx: number,
    feedback: ChatAnswerFeedbackType,
  ) {
    await this.chatSessionCollection.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          [`messages.${msgIdx}.feedback`]: feedback,
        },
      },
    );
  }

  /** *******************************************
   * PROMPT RELATED
   ******************************************** */

  async listPrompts() {
    return this.promptCollection.find({}).toArray();
  }

  async getPrompt(id: ObjectId): Promise<Prompt> {
    return this.promptCollection.findOne({ _id: id });
  }

  async insertPrompt(data: Prompt): Promise<Prompt> {
    const res = await this.promptCollection.insertOne(data);
    return {
      _id: res.insertedId,
      ...data,
    };
  }
  async updatePrompt(id: ObjectId, data: Partial<Prompt>) {
    await this.promptCollection.updateOne({ _id: id }, { $set: data });
  }

  async deletePrompt(id: ObjectId) {
    await this.promptCollection.deleteOne({ _id: id });
  }
}

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ObjectId } from 'mongodb';
import { REDIS } from '../common/redis/redis.module';
import { splitTextIntoChunksOnLines } from '../importers/chunker';
import { UserSparse } from '../user/user.schema';
import { OpenaiChatbotService } from './chatbot/openaiChatbotService';
import { KnowledgebaseDbService } from './knowledgebase-db.service';
import { checkUserIsOwnerOfKb } from './knowledgebase-utils';
import { AddCustomChunkDTO } from './knowledgebase.dto';
import {
  KbDataStore,
  CHUNK_SIZE,
  Chunk,
  ChunkStatus,
  DataStoreType,
  DataStoreStatus,
} from './knowledgebase.schema';

function getEmbeddingsCacheKey(kbId: ObjectId): string {
  return `e_${kbId.toHexString()}`;
}

@Injectable()
export class DataStoreService {
  constructor(
    private kbDbService: KnowledgebaseDbService,
    private openaiChatbotService: OpenaiChatbotService,
    @Inject(REDIS) private redis: Redis,
  ) {}

  private async clearEmbeddingsCacheForKnowledgebase(kbId: ObjectId) {
    const cacheKey = getEmbeddingsCacheKey(kbId);
    this.redis.del(cacheKey);
  }

  /*********************************************************
   * DATA STORE RELATED SERVICE FNS
   *********************************************************/

  async generateChunksAndEmbeddingsForDataStoreItem(dsItem: KbDataStore) {
    // If already trained do nothing and return
    if (dsItem.status === DataStoreStatus.TRAINED) {
      return;
    }

    let dsItemChunks: Chunk[] = [];

    if (dsItem.status === DataStoreStatus.CREATED) {
      // Split content into chunks and add to db
      const chunks = splitTextIntoChunksOnLines(dsItem.content, CHUNK_SIZE);

      const ts = new Date();
      const chunksToInsert: Chunk[] = chunks.map((c) => ({
        url: dsItem.url,
        title: dsItem.title,
        chunk: c,
        knowledgebaseId: dsItem.knowledgebaseId,
        dataStoreId: dsItem._id,
        status: ChunkStatus.CREATED,
        type: dsItem.type,
        createdAt: ts,
        updatedAt: ts,
      }));
      const chunkIds = await this.kbDbService.insertChunksBulk(chunksToInsert);

      // Update the data store item as CHUNKED
      await this.kbDbService.updateKbDataStoreItem(dsItem._id, {
        status: DataStoreStatus.CHUNKED,
      });

      for (let i = 0; i < chunksToInsert.length; i++) {
        const chunk = {
          _id: chunkIds[i],
          ...chunksToInsert[i],
        };
        dsItemChunks.push(chunk);
      }
    } else {
      // In case the status is not CREATE ie CHUNKED, then chunks were
      // already created earlier, get those chunks and generate embeddings again
      const dsItemChunksIdDocs =
        await this.kbDbService.getChunksForDataStoreItem(dsItem._id);
      const dsItemChunksIds = dsItemChunksIdDocs.map((d) => d._id);
      dsItemChunks = await this.kbDbService.getChunkByIdBulk(dsItemChunksIds);
    }

    // For each chunk generate embedding
    for (const chunk of dsItemChunks) {
      if (chunk.status === ChunkStatus.EMBEDDING_GENERATED) continue;
      await this.openaiChatbotService.addEmbeddingsForChunk(
        dsItem.knowledgebaseId,
        chunk,
      );
      console.log(`Added embedding for ${chunk.title}`);
    }

    // Update the data store item as TRAINED and clear embeddings cache
    await Promise.all([
      this.kbDbService.updateKbDataStoreItem(dsItem._id, {
        status: DataStoreStatus.TRAINED,
      }),
      this.clearEmbeddingsCacheForKnowledgebase(dsItem.knowledgebaseId),
    ]);
  }

  /**
   * Insert content to data store, create chunks and store embeddings
   * @param data
   * @returns
   */
  async insertToDataStoreAndCreateEmbeddings(data: KbDataStore) {
    // First insert the item to data store
    const dsItem = await this.kbDbService.insertToKbDataStore(data);

    await this.generateChunksAndEmbeddingsForDataStoreItem(dsItem);

    return dsItem;
  }

  /**
   * Update data store item and recreate chunks and embeddings
   * @param id
   * @param data
   */
  async updateDataStoreContentAndCreateEmbeddings(
    id: ObjectId,
    data: Pick<KbDataStore, 'content' | 'title'>,
  ) {
    // Get the existing data store ite
    const dsItem = await this.kbDbService.getKbDataStoreItemById(id);

    // Get existing chunks for given data store item (To Remove later)
    const chunks = await this.kbDbService.getChunksForDataStoreItem(id);
    const chunkIds = chunks.map((c) => c._id);

    // Update ds item
    await this.kbDbService.updateKbDataStoreItem(id, {
      ...data,
      status: DataStoreStatus.CREATED,
    });
    dsItem.status = DataStoreStatus.CREATED;
    dsItem.content = data.content;
    dsItem.title = data.title;

    await this.generateChunksAndEmbeddingsForDataStoreItem(dsItem);

    // Now that new chunks are inserted delete old ones and embeddings
    await Promise.all([
      this.kbDbService.deleteEmbeddingsByIdBulk(chunkIds),
      this.kbDbService.deleteChunksByIdBulk(chunkIds),
    ]);
  }

  /**
   * Delete a data store item and its associated chunks & embeddings
   * @param id
   */
  async deleteDataStoreItemAndAssociatedEmbeddings(id: ObjectId) {
    const dsItem = await this.kbDbService.getKbDataStoreItemById(id);

    // Get chunks for given data store item
    const chunks = await this.kbDbService.getChunksForDataStoreItem(id);
    const chunkIds = chunks.map((c) => c._id);

    // Delete embeddings for chunks
    await this.kbDbService.deleteEmbeddingsByIdBulk(chunkIds);

    // Delete chunks
    await this.kbDbService.deleteChunksByIdBulk(chunkIds);

    // Delete ds item
    await this.kbDbService.deleteKbDataStoreItem(id);

    // Clear embeddings cache
    await this.clearEmbeddingsCacheForKnowledgebase(dsItem.knowledgebaseId);
  }

  /*********************************************************
   * CUSTOM TRAINING DATA
   *********************************************************/

  /**
   * Add custom data Q & A to knowledgebase
   * @param user
   * @param knowledgebaseId
   * @param data
   */
  async addCustomDataToKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    data: AddCustomChunkDTO,
  ) {
    const kbId = new ObjectId(knowledgebaseId);
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    const ts = new Date();

    // Insert entry to KbDataStore
    let dsItem: KbDataStore = {
      knowledgebaseId: kbId,
      title: data.q,
      content: data.a,
      type: DataStoreType.CUSTOM,
      status: DataStoreStatus.CREATED,
      createdAt: ts,
      updatedAt: ts,
    };

    dsItem = await this.insertToDataStoreAndCreateEmbeddings(dsItem);
    return dsItem;
  }

  /**
   * Get data store item detail
   * @param user
   * @param knowledgebaseId
   * @param dataStoreId
   */
  async getDataStoreItemDetail(
    user: UserSparse,
    knowledgebaseId: string,
    dataStoreId: string,
  ) {
    const kbId = new ObjectId(knowledgebaseId);
    const dId = new ObjectId(dataStoreId);

    // Validations
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);
    const dsItem = await this.kbDbService.getKbDataStoreItemById(dId);
    if (!dsItem.knowledgebaseId.equals(kbId)) {
      throw new HttpException('Invalid DataStore Id', HttpStatus.UNAUTHORIZED);
    }

    return dsItem;
  }

  /**
   * Get custom chunks in Knowledgebase
   * @param user
   * @param knowledgebaseId
   * @returns
   */
  async listDataStoreItemsInKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    pageSize: number,
    type?: DataStoreType,
    page?: number,
  ) {
    const kbId = new ObjectId(knowledgebaseId);
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    return this.kbDbService.getPaginatedDataStoreItemsForKnowledgebase(
      kbId,
      pageSize,
      type,
      page,
    );
  }

  async deleteDataStoreItemFromKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    dataStoreId: string,
  ) {
    const kbId = new ObjectId(knowledgebaseId);
    const dId = new ObjectId(dataStoreId);

    // Validations
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);
    const dsItem = await this.kbDbService.getKbDataStoreItemById(dId);
    if (!dsItem.knowledgebaseId.equals(kbId)) {
      throw new HttpException('Invalid DataStore Id', HttpStatus.UNAUTHORIZED);
    }

    await this.deleteDataStoreItemAndAssociatedEmbeddings(dId);
  }

  async updateDataStoreItemForKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    dataStoreId: string,
    data: AddCustomChunkDTO,
  ) {
    const kbId = new ObjectId(knowledgebaseId);
    const dId = new ObjectId(dataStoreId);

    // Validations
    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);
    const dsItem = await this.kbDbService.getKbDataStoreItemById(dId);
    if (!dsItem.knowledgebaseId.equals(kbId)) {
      throw new HttpException('Invalid DataStore Id', HttpStatus.UNAUTHORIZED);
    }

    await this.updateDataStoreContentAndCreateEmbeddings(dId, {
      title: data.q,
      content: data.a,
    });
  }
}

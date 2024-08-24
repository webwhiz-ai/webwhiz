import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ObjectId } from 'mongodb';
import { toSql } from 'pgvector/pg';
import { DataStoreType, TopChunksResponse } from './knowledgebase.schema';

/**
 * Service for interacting with the Postgres vector database.
 */
@Injectable()
export class EmbeddingsDbService {
  private readonly logger;
  constructor(private dataSource: DataSource) {
    this.logger = new Logger(EmbeddingsDbService.name);
  }

  /**
   * Inserts embeddings data into the PostgreSQL database.
   * @param data - The embeddings data to be inserted.
   * @returns A Promise that resolves to the result of the insertion operation.
   */
  async insertEmbeddingsInPg(data: {
    _id: string;
    knowledgebaseId: string;
    embeddings: number[];
    embeddingModel: string;
    type: string;
  }) {
    const query = `
      INSERT INTO kb_embeddings_pg (_id, knowledgebase_id, embeddings, embedding_model, type, created_at, updated_at)
      VALUES ($1, $2, $3::vector, $4, $5, NOW(), NOW())
    `;
    const params = [
      data._id,
      data.knowledgebaseId,
      toSql(data.embeddings),
      data.embeddingModel,
      data.type,
    ];
    try {
      return await this.dataSource.query(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to insert embeddings: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Retrieves the top N chunks for embedding based on the given query embedding, knowledgebase ID, and limit.
   * @param queryEmbedding - The query embedding as an array of numbers.
   * @param kbId - The knowledgebase ID.
   * @param n - The limit for the number of chunks to retrieve.
   * @returns A Promise that resolves to an array of objects containing the _id and similarity of the chunks.
   */
  async getTopNChunksForEmbedding(
    queryEmbedding: number[],
    kbId: ObjectId,
    n: number,
  ): Promise<TopChunksResponse[]> {
    const query = `
      SELECT _id, 1 - (embeddings <=> $1::vector) as similarity
      FROM kb_embeddings_pg
      WHERE knowledgebase_id = $2
      ORDER BY similarity DESC
      LIMIT $3
    `;

    try {
      const result = await this.dataSource.query(query, [
        toSql(queryEmbedding),
        kbId.toHexString(),
        n,
      ]);

      return result.map((chunk) => ({
        chunkId: { $oid: chunk._id },
        similarity: parseFloat(chunk.similarity),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get top chunks for embedding: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Updates the embeddings for a specific chunk.
   * @param chunkId - The ID of the chunk to update.
   * @param embeddings - The new embeddings to set for the chunk.
   */
  async updateEmbeddingsForChunkInPg(chunkId: ObjectId, embeddings: number[]) {
    const query = `
      UPDATE kb_embeddings_pg
      SET embeddings = $1::vector, updated_at = NOW()
      WHERE _id = $2
    `;
    try {
      await this.dataSource.query(query, [
        toSql(embeddings),
        chunkId.toHexString(),
      ]);
    } catch (error) {
      this.logger.error(
        `Failed to update embeddings: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Deletes embeddings for a knowledge base in the PostgreSQL database.
   * @param kbId - The ID of the knowledge base.
   * @param type - The type of data store (optional).
   * @returns A promise that resolves when the embeddings are deleted.
   */
  async deleteEmbeddingsForKbInPg(kbId: ObjectId, type?: DataStoreType) {
    let query = `
      DELETE FROM kb_embeddings_pg
      WHERE knowledgebase_id = $1
    `;
    const params = [kbId.toHexString()];

    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    try {
      await this.dataSource.query(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to delete embeddings for KB: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Deletes embeddings for a chunk in the PostgreSQL database.
   * @param chunkId - The ID of the chunk to delete embeddings for.
   * @returns A promise that resolves when the embeddings are deleted.
   */
  async deleteEmbeddingsForChunkInPg(chunkId: ObjectId) {
    const query = `
      DELETE FROM kb_embeddings_pg
      WHERE _id = $1
    `;
    try {
      await this.dataSource.query(query, [chunkId.toHexString()]);
    } catch (error) {
      this.logger.error(
        `Failed to delete embeddings for chunk: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Deletes embeddings by their IDs in bulk from the PostgreSQL database.
   * @param ids - An array of ObjectIds representing the IDs of the embeddings to be deleted.
   */
  async deleteEmbeddingsByIdBulkInPg(ids: ObjectId[]) {
    const query = `
      DELETE FROM kb_embeddings_pg
      WHERE _id = ANY($1)
    `;
    try {
      await this.dataSource.query(query, [ids.map((id) => id.toHexString())]);
    } catch (error) {
      this.logger.error(
        `Failed to delete embeddings in bulk: ${error.message}`,
        error.stack,
      );
    }
  }
}

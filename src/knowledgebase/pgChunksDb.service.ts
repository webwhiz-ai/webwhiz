import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Chunk, ChunkStatus, DataStoreType } from './knowledgebase.schema';

/**
 * Service for interacting with PostgreSQL chunks table.
 */
@Injectable()
export class PgChunksDbService {
  private readonly logger = new Logger(PgChunksDbService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * Insert multiple chunks into PostgreSQL in bulk.
   * @param chunks - Array of chunks to insert
   */
  async insertChunksBulkInPg(chunks: Chunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const values = chunks
      .map((_, idx) => {
        const base = idx * 10;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${
          base + 5
        }, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${
          base + 10
        })`;
      })
      .join(', ');

    const query = `
      INSERT INTO kb_chunks_pg (
        _id, knowledgebase_id, data_store_id, url, title,
        chunk, status, type, created_at, updated_at
      )
      VALUES ${values}
    `;

    const params = chunks.flatMap((c) => [
      c._id.toHexString(),
      c.knowledgebaseId.toHexString(),
      c.dataStoreId.toHexString(),
      c.url || null,
      c.title || null,
      c.chunk,
      c.status,
      c.type,
      c.createdAt,
      c.updatedAt,
    ]);

    try {
      await this.dataSource.query(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to insert chunks in bulk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get multiple chunks by their IDs (HOT PATH - used in every chat query).
   * @param ids - Array of chunk IDs
   * @returns Array of chunks
   */
  async getChunkByIdBulkInPg(ids: ObjectId[]): Promise<Chunk[]> {
    if (ids.length === 0) return [];

    const query = `
      SELECT
        _id, knowledgebase_id, data_store_id, url, title,
        chunk, status, type, created_at, updated_at
      FROM kb_chunks_pg
      WHERE _id = ANY($1)
    `;

    try {
      const rows = await this.dataSource.query(query, [
        ids.map((id) => id.toHexString()),
      ]);

      return rows.map((row) => ({
        _id: new ObjectId(row._id),
        knowledgebaseId: new ObjectId(row.knowledgebase_id),
        dataStoreId: new ObjectId(row.data_store_id),
        url: row.url,
        title: row.title,
        chunk: row.chunk,
        status: row.status as ChunkStatus,
        type: row.type as DataStoreType,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get chunks by ID bulk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update a chunk by its ID.
   * @param id - Chunk ID
   * @param chunk - Partial chunk data to update
   */
  async updateChunkByIdInPg(
    id: ObjectId,
    chunk: Partial<Chunk>,
  ): Promise<void> {
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (chunk.url !== undefined) {
      setClauses.push(`url = $${paramIdx++}`);
      params.push(chunk.url);
    }
    if (chunk.title !== undefined) {
      setClauses.push(`title = $${paramIdx++}`);
      params.push(chunk.title);
    }
    if (chunk.chunk !== undefined) {
      setClauses.push(`chunk = $${paramIdx++}`);
      params.push(chunk.chunk);
    }
    if (chunk.status !== undefined) {
      setClauses.push(`status = $${paramIdx++}`);
      params.push(chunk.status);
    }
    if (chunk.type !== undefined) {
      setClauses.push(`type = $${paramIdx++}`);
      params.push(chunk.type);
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(id.toHexString());

    const query = `
      UPDATE kb_chunks_pg
      SET ${setClauses.join(', ')}
      WHERE _id = $${paramIdx}
    `;

    try {
      await this.dataSource.query(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to update chunk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete multiple chunks by their IDs.
   * @param ids - Array of chunk IDs to delete
   */
  async deleteChunksByIdBulkInPg(ids: ObjectId[]): Promise<void> {
    if (ids.length === 0) return;

    const query = `DELETE FROM kb_chunks_pg WHERE _id = ANY($1)`;

    try {
      await this.dataSource.query(query, [ids.map((id) => id.toHexString())]);
    } catch (error) {
      this.logger.error(
        `Failed to delete chunks in bulk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete all chunks for a knowledgebase (cascade delete).
   * @param kbId - Knowledgebase ID
   * @param type - Optional filter by data store type
   */
  async deleteChunksForKnowledgebaseInPg(
    kbId: ObjectId,
    type?: DataStoreType,
  ): Promise<void> {
    let query = `DELETE FROM kb_chunks_pg WHERE knowledgebase_id = $1`;
    const params = [kbId.toHexString()];

    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    try {
      await this.dataSource.query(query, params);
    } catch (error) {
      this.logger.error(
        `Failed to delete chunks for KB: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get chunk IDs for a data store item.
   * @param dataStoreId - Data store ID
   * @returns Array of objects with _id field
   */
  async getChunksForDataStoreItemInPg(
    dataStoreId: ObjectId,
  ): Promise<Array<Pick<Chunk, '_id'>>> {
    const query = `SELECT _id FROM kb_chunks_pg WHERE data_store_id = $1`;

    try {
      const rows = await this.dataSource.query(query, [
        dataStoreId.toHexString(),
      ]);

      return rows.map((row) => ({
        _id: new ObjectId(row._id),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get chunks for data store item: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all chunks for a knowledgebase with optional status filter (async iterator).
   * @param kbId - Knowledgebase ID
   * @param status - Optional status filter
   * @yields Individual chunks
   */
  async *getChunksForKnowledgebaseInPg(
    kbId: ObjectId,
    status?: ChunkStatus,
  ): AsyncGenerator<Chunk> {
    let query = `
      SELECT
        _id, knowledgebase_id, data_store_id, url, title,
        chunk, status, type, created_at, updated_at
      FROM kb_chunks_pg
      WHERE knowledgebase_id = $1
    `;
    const params: any[] = [kbId.toHexString()];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    try {
      const rows = await this.dataSource.query(query, params);

      for (const row of rows) {
        yield {
          _id: new ObjectId(row._id),
          knowledgebaseId: new ObjectId(row.knowledgebase_id),
          dataStoreId: new ObjectId(row.data_store_id),
          url: row.url,
          title: row.title,
          chunk: row.chunk,
          status: row.status as ChunkStatus,
          type: row.type as DataStoreType,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to get chunks for KB: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

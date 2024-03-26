import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { toSql } from 'pgvector/pg';
import { Repository } from 'typeorm';
import { KbEmbeddingsPg } from '../common/entity/kbEmbeddings.entity';
import { TopChunksResponse } from './knowledgebase.schema';

@Injectable()
export class EmbeddingsDbService {
  constructor(
    @InjectRepository(KbEmbeddingsPg)
    private pgEmbeddingsRepository: Repository<KbEmbeddingsPg>,
  ) { }

  /*********************************************************
   * POSTGRES EMBEDDING TABLE
   *********************************************************/

  /**
   * Inserts embeddings data into the PostgreSQL database.
   * @param data - The embeddings data to be inserted.
   * @returns A Promise that resolves to the result of the insertion operation.
   */
  async insertEmbeddingsToPg(data: KbEmbeddingsPg) {
    const res = await this.pgEmbeddingsRepository.insert(data);
    return res;
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
    const result = await this.pgEmbeddingsRepository
      .createQueryBuilder()
      .select('_id')
      .addSelect(`(1 - (vector(embeddings) <=> :embeddings))`, 'similarity')
      .where('"knowledgebaseId" = :kbId', { kbId: kbId.toString() })
      .orderBy('similarity', 'DESC')
      .limit(n)
      .setParameter('embeddings', toSql(queryEmbedding))
      .getRawMany();

    const topChunks: TopChunksResponse[] = result.map((chunk) => ({
      chunkId: { $oid: chunk._id },
      similarity: chunk.similarity,
    }));
    return topChunks;
  }
}

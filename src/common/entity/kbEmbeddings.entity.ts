import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * The `KbEmbeddingsPg` entity represents the embeddings data for knowledgebases stored in PostgreSQL database.
 * It includes an identifier, the associated knowledgebase ID, the embeddings, creation date,
 * the embedding model used and the type of data('WEBPAGE'|'CUSTOM'|'DOCUMENT'), .
 */
@Entity()
// Index on knowledgebaseId
@Index(['knowledgebaseId'])
export class KbEmbeddingsPg {
  /**
   * Represents the unique identifier for the entity. This will be same as the `_id` of chunks
   * collection in MongoDB.
   */
  @PrimaryColumn()
  _id: string;

  /**
   * The ID of the knowledge base.
   */
  @Column()
  knowledgebaseId: string;

  /**
   * Represents the embeddings for a chunk.
   */
  @Column()
  embeddings: string;

  /**
   * The date and time when the entity was created.
   */
  @Column()
  createdAt: Date;

  /**
   * Represents the date and time when the entity was last updated.
   */
  @Column()
  updatedAt: Date;

  /**
   * Represents the embedding model used for the knowledge base.
   */
  @Column()
  embeddingModel: string;

  // Type of Data source - WEBPAGE|CUSTOM|DOCUMENT
  @Column()
  type: string;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
/**
 * The `KbEmbeddingsPg` entity represents the embeddings data for knowledgebases stored in PostgreSQL database.
 * It includes an identifier, the associated knowledgebase ID, the embeddings, creation date,
 * the embedding model used and the type of data('WEBPAGE'|'CUSTOM'|'DOCUMENT'), .
 */
export class KbEmbeddingsPg {
  @PrimaryColumn()
  _id: string;

  @Column()
  knowledgebaseId: string;

  @Column()
  embeddings: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  embeddingModel: string;

  @Column()
  type: string;
}

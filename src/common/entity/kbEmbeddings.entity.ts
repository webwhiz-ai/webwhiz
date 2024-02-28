import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class KbEmbeddings {
  @PrimaryColumn()
  _id: string;

  @Column()
  kbid: string;

  @Column()
  embeddings: string;

  @Column()
  type: string;
}

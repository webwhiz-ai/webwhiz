import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class KbEmbeddings {
  @PrimaryGeneratedColumn()
  _id: string;

  @Column()
  kbId: string;

  @Column()
  embeddings: string;

  @Column()
  type: string;
}

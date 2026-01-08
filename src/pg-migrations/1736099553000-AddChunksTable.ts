import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChunksTable1736099553000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS kb_chunks_pg (
        _id VARCHAR(24) PRIMARY KEY,
        knowledgebase_id VARCHAR(24) NOT NULL,
        data_store_id VARCHAR(24) NOT NULL,
        url TEXT,
        title TEXT,
        chunk TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS kb_chunks_pg_knowledgebase_id_idx
      ON kb_chunks_pg(knowledgebase_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS kb_chunks_pg_data_store_id_idx
      ON kb_chunks_pg(data_store_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS kb_chunks_pg_kb_type_idx
      ON kb_chunks_pg(knowledgebase_id, type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS kb_chunks_pg_status_idx
      ON kb_chunks_pg(knowledgebase_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS kb_chunks_pg;`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Represents the initial setup migration.
 */
export class InitialSetup1724484460582 implements MigrationInterface {
  name = 'InitialSetup1724484460582';

  /**
   * Runs the migration to set up the initial database schema.
   * @param queryRunner - The query runner used to execute database queries.
   * @returns A promise that resolves when the migration is complete.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Running migration InitialSetup1724484460582');
    console.log(
      '******************************************************************************',
    );
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');

    // Create kb_embeddings_pg table
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS kb_embeddings_pg (
            _id VARCHAR PRIMARY KEY,
            knowledgebase_id VARCHAR NOT NULL,
            embeddings vector(1536),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            embedding_model VARCHAR,
            type VARCHAR
        )
    `);

    // Create knowledgebase ID index
    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS kb_embeddings_knowledgebase_id_idx 
        ON kb_embeddings_pg (knowledgebase_id)
    `);
  }

  /**
   * Reverts the changes made in the up method.
   * Drops the knowledgebase ID index, kb_embeddings_pg table, and pgvector extension.
   * @param queryRunner - The query runner used to execute database queries.
   * @returns A promise that resolves when the migration is successfully reverted.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop knowledgebase ID index
    await queryRunner.query(
      'DROP INDEX IF EXISTS kb_embeddings_knowledgebase_id_idx',
    );

    // Drop kb_embeddings_pg table
    await queryRunner.query('DROP TABLE IF EXISTS kb_embeddings_pg');

    // Drop pgvector extension
    await queryRunner.query('DROP EXTENSION IF EXISTS vector');
  }
}

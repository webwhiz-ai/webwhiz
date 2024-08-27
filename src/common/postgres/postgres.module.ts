import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/appConfig.service';
import { DataSource } from 'typeorm';

/**
 * Represents a module for interacting with PostgreSQL database.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: async (appConfig: AppConfigService) => ({
        type: 'postgres',
        host: appConfig.get('postgresHost'),
        port: appConfig.get('postgresPort'),
        username: appConfig.get('postgresUser'),
        password: appConfig.get('postgresPassword'),
        database: appConfig.get('postgresDbName'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: false, // Set this to false in production
        migrations: [__dirname + '/../../pg-migrations/*{.ts,.js}'],
        migrationsRun: true, // Run migrations at application startup
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class PostgresModule implements OnModuleInit {
  private readonly logger: Logger;

  constructor(private dataSource: DataSource) {
    this.logger = new Logger(PostgresModule.name);
  }

  /**
   * Initializes the module and performs necessary setup tasks.
   * This method is automatically called when the module is initialized.
   * @returns A Promise that resolves when the initialization is complete.
   */
  async onModuleInit(): Promise<void> {
    // Postgres db initialization is now moved to the migration file, so this is no longer needed
    // await this.initializePgVector();
    // await this.createKbEmbeddingsTable();
    // await this.createKnowledgebaseIdIndex();
    // await this.createVectorIndex();
  }

  /**
   * Initializes the pgvector extension in the PostgreSQL database.
   * This method creates the 'vector' extension if it doesn't already exist.
   */
  private async initializePgVector() {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
      this.logger.log('pgvector extension initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize pgvector extension:', error);
    }
  }

  /**
   * Creates the kb_embeddings_pg table in the PostgreSQL database.
   * If the table already exists, it does nothing.
   */
  private async createKbEmbeddingsTable() {
    try {
      await this.dataSource.query(`
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
      this.logger.log('kb_embeddings_pg table created successfully');
    } catch (error) {
      this.logger.error('Failed to create kb_embeddings_pg table:', error);
    }
  }

  /**
   * Creates a knowledgebase ID index in the PostgreSQL database.
   * If the index already exists, it will not be created again.
   */
  private async createKnowledgebaseIdIndex() {
    try {
      await this.dataSource.query(`
        CREATE INDEX IF NOT EXISTS kb_embeddings_knowledgebase_id_idx 
        ON kb_embeddings_pg (knowledgebase_id);
      `);
      this.logger.log('Knowledgebase ID index created successfully');
    } catch (error) {
      this.logger.error('Failed to create Knowledgebase ID index:', error);
    }
  }

  /**
   * Creates a vector index for kb_embeddings_pg table using ivfflat algorithm.
   * The index is created on the 'embeddings' column and supports vector cosine similarity operations.
   * @returns {Promise<void>} A promise that resolves when the index is created successfully.
   */
  private async createVectorIndex() {
    try {
      await this.dataSource.query(`
        CREATE INDEX IF NOT EXISTS kb_embeddings_vector_idx 
        ON kb_embeddings_pg 
        USING ivfflat (embeddings vector_cosine_ops)
        WITH (lists = 100);
      `);
      this.logger.log('Vector index created successfully');
    } catch (error) {
      this.logger.error('Failed to create vector index:', error);
    }
  }
}

import { Module } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { AppConfigService } from '../config/appConfig.service';

export const MONGODB = 'MONGODB';

@Module({
  providers: [
    {
      provide: MONGODB,
      inject: [AppConfigService],
      useFactory: async (appConfig: AppConfigService): Promise<Db> => {
        const mongoUri = appConfig.get('mongoUri');
        const dbName = appConfig.get('mongoDbName');

        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);

          // Create indexes
          await db
            .collection('users')
            .createIndex({ email: 1 }, { unique: true });

          await db
            .collection('kbDataStore')
            .createIndex({ knowledgebaseId: 1, type: 1 });

          await db.collection('chunks').createIndex({ knowledgebaseId: 1 });
          await db.collection('chunks').createIndex({ dataStoreId: 1 });

          await db
            .collection('kbEmbeddings')
            .createIndex({ knowledgebaseId: 1 });

          await db.collection('knowledgebase').createIndex({ owner: 1 });
          await db
            .collection('knowledgebase')
            .createIndex({ customDomain: 1 }, { sparse: true, unique: true });

          await db
            .collection('offlineMessages')
            .createIndex({ knowledgebaseId: 1 });

          await db
            .collection('chatSessions')
            .createIndex({ knowledgebaseId: 1 });
          await db.collection('chatSessions').createIndex({ slackThreadId: 1 });

          await db.collection('task').createIndex({ name: 1 });

          return db;
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: [MONGODB],
})
export class MongoModule {}

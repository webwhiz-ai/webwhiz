import {
  MiddlewareConsumer,
  Module,
  OnApplicationBootstrap,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CeleryClientModule } from './common/celery/celery-client.module';
import { AppConfigModule } from './common/config/appConfig.module';
import { MongoModule } from './common/mongo/mongo.module';
import { OpenaiModule } from './openai/openai.module';
import { KnowledgebaseModule } from './knowledgebase/knowledgebase.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SentryModule } from './common/sentry/sentry.module';
import { EmailModule } from './common/email/email.module';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { ImportersModule } from './importers/importers.module';
import { TaskModule } from './task/task.module';
import { WebhookModule } from './webhook/webhook.module';
import { SlackBoltMiddleware } from './slack/slack-bolt.middleware';
import { SlackModule } from './slack/slack.module';
import { PublicApisModule } from './public-apis/public-apis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    AppConfigModule,
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.3,
    }),
    RedisModule,
    MongoModule,
    CeleryClientModule,
    TaskModule,
    OpenaiModule,
    KnowledgebaseModule,
    ImportersModule,
    AuthModule,
    UserModule,
    SubscriptionModule,
    EmailModule,
    WebhookModule,
    SlackModule,
    PublicApisModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) { }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
    if (process.env.ENABLE_SLACK_BOT === 'true') {
      consumer.apply(SlackBoltMiddleware).forRoutes('');
    }
  }

  async onApplicationBootstrap() {
    /* Create the vector extension for Postgres if it does not present */
    await this.dataSource.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  }
}

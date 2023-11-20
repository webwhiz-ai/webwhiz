import { Module } from '@nestjs/common';
import { CeleryClientModule } from '../common/celery/celery-client.module';
import { MongoModule } from '../common/mongo/mongo.module';
import { RedisModule } from '../common/redis/redis.module';
import { OpenaiModule } from '../openai/openai.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserModule } from '../user/user.module';
import { ChatbotController } from './chatbot/chatbot.controller';
import { ChatbotService } from './chatbot/chatbot.service';
import { KnowledgebaseController } from './knowledgebase.controller';
import { KnowledgebaseService } from './knowledgebase.service';
import { KnowledgebaseDbService } from './knowledgebase-db.service';
import { OpenaiChatbotService } from './chatbot/openaiChatbotService';
import { OfflineMsgService } from './offline-msg/offline-msg.service';
import { OfflineMessageController } from './offline-msg/offline-msg.controller';
import { PromptsController } from './prompt/prompt.controller';
import { PromptService } from './prompt/prompt.service';
import { DataStoreService } from './datastore.service';
import { EmailModule } from '../common/email/email.module';
import { TaskModule } from '../task/task.module';
import { CustomKeyService } from './custom-key.service';
import { WebhookModule } from '../webhook/webhook.module';
import { ChatGateway } from './chatbot/chatbot.gateway';

@Module({
  imports: [
    MongoModule,
    RedisModule,
    OpenaiModule,
    CeleryClientModule,
    UserModule,
    SubscriptionModule,
    EmailModule,
    TaskModule,
    WebhookModule,
  ],
  controllers: [
    ChatbotController,
    KnowledgebaseController,
    OfflineMessageController,
    PromptsController,
  ],
  providers: [
    KnowledgebaseDbService,
    KnowledgebaseService,
    DataStoreService,
    ChatbotService,
    OpenaiChatbotService,
    OfflineMsgService,
    PromptService,
    CustomKeyService,
    ChatGateway,
  ],
  exports: [KnowledgebaseDbService, DataStoreService],
})
export class KnowledgebaseModule {}

import { Module } from '@nestjs/common';
import { MongoModule } from '../common/mongo/mongo.module';
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module';
import { SlackTokenService } from './slack-token.service';
import { SlackBotService } from './slackbot.service';

@Module({
  imports: [KnowledgebaseModule, MongoModule],
  providers: [SlackBotService, SlackTokenService],
  exports: [SlackBotService, SlackTokenService],
})
export class SlackModule { }
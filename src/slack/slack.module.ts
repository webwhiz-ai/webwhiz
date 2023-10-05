import { Module } from '@nestjs/common';
import { MongoModule } from '../common/mongo/mongo.module';
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module';
import { SlackTokenService } from './slack-token.service';
import { SlackService } from './slack.service';
import { SlackBotService } from './slackbot.service';

@Module({
  imports: [KnowledgebaseModule, MongoModule],
  providers: [SlackService, SlackBotService, SlackTokenService],
  exports: [SlackTokenService],
})
export class SlackModule { }

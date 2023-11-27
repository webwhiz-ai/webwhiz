import { Module } from '@nestjs/common';
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module';
import { SlackBotService } from './slackbot.service';

@Module({
  imports: [KnowledgebaseModule],
  providers: [SlackBotService],
  exports: [SlackBotService],
})
export class SlackModule { }
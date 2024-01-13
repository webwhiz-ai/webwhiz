import { Injectable, Logger } from '@nestjs/common';
import { AppMentionEvent } from '@slack/bolt';
import { ChatbotService } from '../knowledgebase/chatbot/chatbot.service';
import { KnowledgebaseDbService } from '../knowledgebase/knowledgebase-db.service';
import { SlackTokenService } from './slack-token.service';

@Injectable()
export class SlackBotService {
  private readonly logger: Logger;
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly kbDbService: KnowledgebaseDbService,
    private readonly slackTokenService: SlackTokenService,
  ) {
    this.logger = new Logger(SlackBotService.name);
  }

  async botProcessAppMention(event: AppMentionEvent, say: any, client: any) {
    // TODO: Fix: Bot is not responding to direct messages
    const loadingMsg = await client.chat.postMessage({
      channel: event.channel,
      text: 'Webwhiz is thinking... ✨',
      typing: true,
      thread_ts: event.thread_ts || event.ts,
    });
    const loadingMsgTs = loadingMsg.ts;
    const teamId = event.team;
    const message = event.text.replace(/<[^>]+>/g, '').trim();

    /* if thread_ts is present, then it is a message in a thread
    if ts value equals thread_ts, then it is a parent message
    if ts value does not equal thread_ts, then it is a reply message */
    const parentMessageTs = event.thread_ts ?? event.ts;
    const isParentMessage = parentMessageTs === event.ts;

    /* if not parent message then check for existing session else, create a new session. */
    let sessionId = null;
    try {
      // Fetch webwhiz botId
      const webwhizKbId =
        await this.slackTokenService.fetchWebWhizBotIdFromDatabase(teamId);
      if (!isParentMessage) {
        sessionId = await this.kbDbService.getSessionIdBySlackThreadId(
          parentMessageTs,
        );
      }

      if (sessionId === null) {
        sessionId = await this.chatbotService.createChatSession(
          webwhizKbId,
          null,
          false,
          'slack',
          parentMessageTs,
        );
      }
      this.logger.debug('sessionId: ' + sessionId);

      const responseAnswer = await this.chatbotService.getAnswer(
        sessionId,
        message,
      );

      await client.chat.update({
        channel: event.channel,
        text: responseAnswer['response'],
        // thread_ts: parentMessageTs,
        ts: loadingMsgTs,
      });
    } catch (error) {
      this.logger.error(
        'Error occurred while processing slack message: ' + error.message,
      );
      await client.chat.update({
        channel: event.channel,
        text: 'Sorry, I am unable to answer your question. Please try again later.',
        ts: loadingMsgTs,
      });
    }
  }
}

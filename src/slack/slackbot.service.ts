/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AppMentionEvent } from '@slack/bolt';
import { ChatbotService } from '../knowledgebase/chatbot/chatbot.service';
import { KnowledgebaseDbService } from '../knowledgebase/knowledgebase-db.service';

@Injectable()
export class SlackBotService {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly kbDbService: KnowledgebaseDbService,
  ) { }

  async botProcessAppMention(event: AppMentionEvent, say: any, client: any) {
    // TODO: Fix: Bot is not responding to direct messages
    const loadingMsg = await client.chat.postMessage({
      channel: event.channel,
      text: 'Webwhiz is thinking... ✨',
      typing: true,
      thread_ts: event.thread_ts || event.ts,
    });
    const loadingMsgTs = loadingMsg.ts;
    console.log('event: ', event);
    /* event:  {
      client_msg_id: '6b58de35-845f-462a-b4fa-02c467e718c5',
      type: 'app_mention',
      text: '<@U067PRPASHX> Hello',
      user: 'U067DK84336',
      ts: '1701031166.923619',
      blocks: [ { type: 'rich_text', block_id: 'jPZfh', elements: [Array] } ],
      team: 'T06805KARRN',
      channel: 'C066WKZJRU7',
      event_ts: '1701031166.923619'
    } */
    const teamId = event.team;
    const message = event.text.replace(/<[^>]+>/g, '').trim();
    console.log('message: ', message);
    // TODO: Fetch webwhiz botId
    const webwhizKbId = '65188ee72d83026138772455';

    /* if thread_ts is present, then it is a message in a thread
    if ts value equals thread_ts, then it is a parent message
    if ts value does not equal thread_ts, then it is a reply message */
    const parentMessageTs = event.thread_ts ?? event.ts;
    const isParentMessage = parentMessageTs === event.ts;

    /* if not parent message then check for existing session else, create a new session. */
    let sessionId = null;
    try {
      if (!isParentMessage) {
        console.log('not parentMessage- checking for existing session');
        sessionId = await this.kbDbService.getSessionIdBySlackThreadId(
          parentMessageTs,
        );
        console.log('found existing session from db: ', sessionId);
      }

      if (sessionId === null) {
        console.log('parentMessage- creating new session');
        sessionId = await this.chatbotService.createChatSession(
          webwhizKbId,
          null,
          false,
          'slack',
          parentMessageTs,
        );
      }
      console.log('sessionId: ', sessionId);

      const responseAnswer = await this.chatbotService.getAnswer(
        sessionId,
        message,
      );
      console.log('responseAnswer: ', responseAnswer['response']);

      await client.chat.update({
        channel: event.channel,
        text: responseAnswer['response'],
        // thread_ts: parentMessageTs,
        ts: loadingMsgTs,
      });
    } catch (error) {
      console.log('error: ', error);
      await client.chat.postMessage({
        channel: event.channel,
        text: 'Sorry, I am unable to answer your question. Please try again later.',
        thread_ts: parentMessageTs,
        ts: loadingMsgTs,
      });
    }
  }
}

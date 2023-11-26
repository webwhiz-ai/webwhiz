import { Inject } from '@nestjs/common';
import { ChatbotService } from '../knowledgebase/chatbot/chatbot.service';
import { KnowledgebaseDbService } from '../knowledgebase/knowledgebase-db.service';
import { SlackTokenService } from './slack-token.service';

export class SlackBotService {
  @Inject(ChatbotService)
  private readonly chatbotService: ChatbotService;
  @Inject(SlackTokenService)
  private readonly slackTokenSerivice: SlackTokenService;
  @Inject(KnowledgebaseDbService)
  private readonly kbDbService: KnowledgebaseDbService;

  public async onAppMention({ event, say, logger, client }) {
    try {
      // this.botProcess(event, say, client);
    } catch (error) {
      logger.error(error);
    }
  }

  async botProcess(event: any, say: any, client: any, context: any) {
    const user = event['user'];
    const thread_ts = event['ts'];
    const channel = event['channel'];
    const msg = event['text'];

    const webwhizBotId =
      await this.slackTokenSerivice.fetchWebWhizBotIdFromDatabase(event.team);
    const message = this.extractMessage(msg);

    // console.log('message ' + message);
    // console.log('ts ' + event['ts']);
    // console.log('thread_ts ' + event['thread_ts']);

    // if thread_ts is present, then it is a message in a thread
    // if ts value equals thread_ts, then it is a parent message
    // if ts value does not equal thread_ts, then it is a reply message
    const parent_thread_ts = event['thread_ts']
      ? event['thread_ts']
      : thread_ts;

    let sessionId = null;
    try {
      if (parent_thread_ts !== thread_ts) {
        // fetch sessionId from db
        sessionId = await this.kbDbService.getSesstionIdbySlackThreadId(
          parent_thread_ts,
        );
      }

      if (sessionId === null) {
        // create new session
        sessionId = await this.chatbotService.createChatSession(
          webwhizBotId,
          null,
          null,
          'slackBot',
          parent_thread_ts,
        );
      }

      console.log('sessionId: ', sessionId);

      const answerResponse = await this.chatbotService.getAnswer(
        sessionId,
        message,
      );

      console.log('response: ' + answerResponse['response']);

      const result = await client.chat.postMessage({
        channel: channel,
        text: answerResponse['response'],
        thread_ts: parent_thread_ts,
      });
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  extractMessage(inputString): string {
    const regex = /<[^>]+>\s*(.+)/; // This regex captures everything after the '<...>' part
    const match = inputString.match(regex);

    if (match) {
      const message = match[1]; // The message is in the captured group 1
      console.log('message: ', message);
      return message;
    } else {
      console.log('No message found.');
      return '';
    }
  }
}

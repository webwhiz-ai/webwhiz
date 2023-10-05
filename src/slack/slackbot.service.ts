import { Inject } from '@nestjs/common';
import { ChatbotService } from '../knowledgebase/chatbot/chatbot.service';

export class SlackBotService {
  @Inject(ChatbotService)
  private readonly chatbotService: ChatbotService;

  public async onAppMention({ event, say, logger, client }) {
    try {
      this.botProcess(event, say, client);
    } catch (error) {
      logger.error(error);
    }
  }

  async botProcess(event: any, say: any, client: any) {
    const user = event['user'];
    const thread_ts = event['ts'];
    const channel = event['channel'];
    const msg = event['text'];

    const message = this.extractMessage(msg);

    if (message === null) {
      say('No message found');
      return;
    }

    console.log('message ' + message);
    console.log('ts ' + event['ts']);
    console.log('thread_ts ' + event['thread_ts']);

    // if thread_ts is present, then it is a message in a thread
    // if ts value equals thread_ts, then it is a parent message
    // if ts value does not equal thread_ts, then it is a reply message 
    const parent_thread_ts = event['thread_ts']
      ? event['thread_ts']
      : thread_ts;

    try {
      // 6416c5dc35e8d875fd4c0ec1: kbId
      const newSessionId = await this.chatbotService.createChatSession(
        '65188ee72d83026138772455',
      );
      console.log(newSessionId);

      const answerResponse = await this.chatbotService.getAnswer(
        newSessionId,
        message,
      );
      console.log('response: ' + answerResponse['response']);

      // await say(`<@${event.user}> ${answerResponse['response']}`);
      const result = await client.chat.postMessage({
        channel: channel,
        text: answerResponse['response'],
        thread_ts: parent_thread_ts,
        metadata: {
          event_type: 'webwhiz_thread_created',
          event_payload: { session_id: newSessionId },
        },
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
      console.log(message); // Output: 'hey'
      return message;
    } else {
      console.log('No message found.');
      return null;
    }
  }
}

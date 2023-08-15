import { ChatMessageWebhookPayload } from '../knowledgebase/knowledgebase.schema';
import { OfflineMessageWebhookPayload } from '../knowledgebase/offline-msg/offline-msg.schema';

export enum WebhookEventType {
  CHATBOT_MSG = 'CHATBOT_MSG',
  OFFLINE_MSG = 'OFFLINE_MSG',
}

export interface WebhookEventChatbotMsg {
  event: WebhookEventType.CHATBOT_MSG;
  payload: ChatMessageWebhookPayload;
}

export interface WebhookEventOfflineMsg {
  event: WebhookEventType.OFFLINE_MSG;
  payload: OfflineMessageWebhookPayload;
}

export type WebhookEvent = WebhookEventChatbotMsg | WebhookEventOfflineMsg;

import { ObjectId } from 'mongodb';

export const OFFLINE_MSG_COLLECTION = 'offlineMessages';

export interface OfflineMessage {
  _id?: ObjectId;
  knowledgebaseId: ObjectId;
  chatSessionId: ObjectId;
  name?: string;
  email: string;
  message: string;
  url?: string;
  createdAt: Date;
}

export interface OfflineMessageWebhookPayload {
  id: string;
  knowledgebaseId: string;
  chatSessionId: string;
  name: string;
  email: string;
  message: string;
  url: string;
  createdAt: Date;
}

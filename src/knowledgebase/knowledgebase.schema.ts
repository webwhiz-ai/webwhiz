import { ObjectId } from 'mongodb';
import { SubscriptionPlanInfo } from '../subscription/subscription.const';
import { UserMonthlyUsage } from '../user/user.schema';
import { CrawlerStats } from '../importers/crawler/crawlee/crawler.types';

/** **************************************************
 * KNOWLEDGEBASE
 *************************************************** */

export const KNOWLEDGEBASE_COLLECTION = 'knowledgebase';

export enum KnowledgebaseStatus {
  CREATED = 'CREATED',
  CRAWLING = 'CRAWLING',
  CRAWLED = 'CRAWLED',
  CRAWL_ERROR = 'CRAWL_ERROR',
  GENERATING_EMBEDDINGS = 'GENERATING_EMBEDDINGS',
  EMBEDDING_ERROR = 'EMBEDDING_ERROR',
  READY = 'READY',
}

export enum UserRoles {
  ADMIN = 'admin',
  EDITOR = 'editor',
  READER = 'reader',
}

export enum EmbeddingModel {
  'OPENAI_EMBEDDING_2' = 'text-embedding-ada-002',
  'OPENAI_EMBEDDING_3' = 'text-embedding-3-small',
}

export interface CustomKeyData {
  useOwnKey: boolean;
  keys?: string[];
}

export interface ParticipantsData {
  id: ObjectId;
  role: UserRoles;
  email: string;
}

export interface Knowledgebase {
  _id?: ObjectId;
  name: string;
  isDemo?: boolean;
  status: KnowledgebaseStatus;
  websiteData: {
    websiteUrl: string;
    urls: string[];
    include: string[];
    exclude: string[];
  };
  crawlData?: {
    stats: CrawlerStats;
  };
  monthUsage?: UserMonthlyUsage;
  chatWidgeData?: any;
  owner: ObjectId;
  participants: ParticipantsData[];
  // Alternate email for knowledgebase
  adminEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  // Custom prompt fields
  model?: string;
  defaultAnswer?: string;
  prompt?: string;
  // Custom domain
  customDomain?: string;
  embeddingModel?: EmbeddingModel;
}

export type KnowledgebaseSparse = Pick<
  Knowledgebase,
  | '_id'
  | 'name'
  | 'status'
  | 'monthUsage'
  | 'crawlData'
  | 'owner'
  | 'participants'
>;

/*********************************************************
 * KB DATA STORE
 *********************************************************/

export const KB_DATASTORE_COLLECTION = 'kbDataStore';

export enum DataStoreType {
  WEBPAGE = 'WEBPAGE',
  CUSTOM = 'CUSTOM',
  DOCUMENT = 'DOCUMENT',
}

export enum DataStoreStatus {
  CREATED = 'CREATED',
  CHUNKED = 'CHUNKED',
  TRAINED = 'TRAINED',
}

export interface KbDataStore {
  _id?: ObjectId;
  knowledgebaseId: ObjectId;
  url?: string;
  title?: string;
  content: string;
  type: DataStoreType;
  status: DataStoreStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type KbDataStoreUrl = Pick<KbDataStore, '_id' | 'url'>;

/*********************************************************
 * CHUNKS
 *********************************************************/

export const CHARS_PER_TOKEN = 4;

// CHUNK SIZE = 1500 tokens
export const CHUNK_SIZE = 1500 * CHARS_PER_TOKEN;

export const CHUNK_COLLECTION = 'chunks';

export enum ChunkStatus {
  CREATED = 'CREATED',
  EMBEDDING_GENERATED = 'EMBEDDING_GENERATED',
}

export interface Chunk {
  _id?: ObjectId;
  knowledgebaseId: ObjectId;
  dataStoreId: ObjectId;
  url?: string;
  title?: string;
  chunk: string;
  status: ChunkStatus;
  type: DataStoreType;
  createdAt: Date;
  updatedAt: Date;
}

/*********************************************************
 * KB EMBEDDINGS
 *********************************************************/

export const KB_EMBEDDING_COLLECTION = 'kbEmbeddings';
export interface KbEmbedding {
  _id?: ObjectId; // Same as chunkId
  knowledgebaseId: ObjectId;
  embeddings: number[];
  type: DataStoreType;
}

/*********************************************************
 * CHAT SESSION
 *********************************************************/

export enum ChatAnswerFeedbackType {
  BAD,
  GOOD,
}

export enum MessageType {
  BOT = 'BOT',
  MANUAL = 'MANUAL',
}

export interface ChatQueryAnswer {
  id: string;
  type?: MessageType;
  q: string;
  a: string;
  qTokens: number;
  aTokens: number;
  ts: Date;
  feedback?: ChatAnswerFeedbackType;
  msg: string;
  sender: string;
  sessionId: string;
}

export const CHAT_SESSION_COLLECTION = 'chatSessions';
export interface ChatSession {
  _id?: ObjectId;
  knowledgebaseId: ObjectId;
  slackThreadId?: string;
  kbName: string;
  defaultAnswer?: string;
  prompt?: string;
  model?: string;
  isDemo?: boolean;
  src?: string;
  isManual?: boolean;
  subscriptionData: SubscriptionPlanInfo;
  customKeys?: CustomKeyData;
  userId: ObjectId;
  isUnread?: boolean;
  messages: ChatQueryAnswer[];
  userData?: any;
  startedAt: Date;
  updatedAt: Date;
  embeddingModel?: EmbeddingModel;
}
export type ChatSessionSparse = Pick<
  ChatSession,
  | '_id'
  | 'knowledgebaseId'
  | 'src'
  | 'isManual'
  | 'messages'
  | 'userData'
  | 'startedAt'
  | 'updatedAt'
>;

export type ChatSessionMessageSparse = Pick<ChatSession, 'messages'>;

export interface ChatMessageWebhookPayload {
  q: string;
  a: string;
  ts: Date;
  session: {
    id: string;
    knowledgebaseId: string;
    kbName: string;
    src: string;
    userData: string;
    startedAt: Date;
    updatedAt: Date;
  };
}

/*********************************************************
 * PROMPT
 *********************************************************/

export const PROMPT_COLLECTION = 'prompts';

export interface Prompt {
  _id: ObjectId;
  prompt: string;
}

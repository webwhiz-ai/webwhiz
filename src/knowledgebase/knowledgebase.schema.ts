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

export interface CustomKeyData {
  useOwnKey: boolean;
  keys?: string[];
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
  // Alternate email for knowledgebase
  adminEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  // Custom prompt fields
  defaultAnswer?: string;
  prompt?: string;
  // Custom domain
  customDomain?: string;
}

export type KnowledgebaseSparse = Pick<
  Knowledgebase,
  '_id' | 'name' | 'status' | 'monthUsage' | 'crawlData' | 'owner'
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

export interface ChatQueryAnswer {
  q: string;
  a: string;
  qTokens: number;
  aTokens: number;
  ts: Date;
  feedback?: ChatAnswerFeedbackType;
}

export const CHAT_SESSION_COLLECTION = 'chatSessions';
export interface ChatSession {
  _id?: ObjectId;
  knowledgebaseId: ObjectId;
  kbName: string;
  defaultAnswer?: string;
  prompt?: string;
  isDemo?: boolean;
  src?: string;
  subscriptionData: SubscriptionPlanInfo;
  customKeys?: CustomKeyData;
  userId: ObjectId;
  isUnread?: boolean;
  messages: ChatQueryAnswer[];
  userData?: any;
  startedAt: Date;
  updatedAt: Date;
}
export type ChatSessionSparse = Pick<
  ChatSession,
  | '_id'
  | 'knowledgebaseId'
  | 'src'
  | 'messages'
  | 'userData'
  | 'startedAt'
  | 'updatedAt'
>;

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

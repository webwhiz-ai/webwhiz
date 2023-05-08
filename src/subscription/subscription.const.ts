import { Subscription } from '../user/user.schema';

export enum SubscriptionType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface SubscriptionPlanInfo {
  name: string;
  type: SubscriptionType;
  maxChatbots: number;
  maxTokens: number;
  maxPages: number;
  maxChunksPerPage: number;
}

export const subscriptionPlanData: Record<Subscription, SubscriptionPlanInfo> =
  {
    [Subscription.FREE]: {
      name: 'FREE',
      type: SubscriptionType.MONTHLY,
      maxChatbots: 0,
      maxTokens: 0,
      maxPages: 0,
      maxChunksPerPage: 0,
    },
    [Subscription.BASE_MONTHLY]: {
      name: 'Base',
      type: SubscriptionType.MONTHLY,
      maxChatbots: 5,
      maxTokens: 4000000,
      maxPages: 100,
      maxChunksPerPage: 100,
    },
    [Subscription.STANDARD_MONTHLY]: {
      name: 'Standard',
      type: SubscriptionType.MONTHLY,
      maxChatbots: 10,
      maxTokens: 10000000,
      maxPages: 1000,
      maxChunksPerPage: 100,
    },
    [Subscription.PREMIUM_MONTHLY]: {
      name: 'Premium',
      type: SubscriptionType.MONTHLY,
      maxChatbots: 100,
      maxTokens: 25000000,
      maxPages: 2500,
      maxChunksPerPage: 100,
    },
    [Subscription.ENTERPRISE_MONTHLY]: {
      name: 'Enterprise',
      type: SubscriptionType.MONTHLY,
      maxChatbots: 999,
      maxTokens: 95000000,
      maxPages: 10000,
      maxChunksPerPage: 100,
    },
    [Subscription.BASE_YEARLY]: {
      name: 'Base',
      type: SubscriptionType.YEARLY,
      maxChatbots: 5,
      maxTokens: 4000000,
      maxPages: 100,
      maxChunksPerPage: 100,
    },
    [Subscription.STANDARD_YEARLY]: {
      name: 'Standard',
      type: SubscriptionType.YEARLY,
      maxChatbots: 10,
      maxTokens: 10000000,
      maxPages: 1000,
      maxChunksPerPage: 100,
    },
    [Subscription.PREMIUM_YEARLY]: {
      name: 'Premium',
      type: SubscriptionType.YEARLY,
      maxChatbots: 100,
      maxTokens: 25000000,
      maxPages: 2500,
      maxChunksPerPage: 100,
    },
    [Subscription.ENTERPRISE_YEARLY]: {
      name: 'Enterprise',
      type: SubscriptionType.YEARLY,
      maxChatbots: 999,
      maxTokens: 95000000,
      maxPages: 10000,
      maxChunksPerPage: 100,
    },
    [Subscription.DEMO_ACCOUNT]: {
      name: 'DEMO',
      type: SubscriptionType.MONTHLY,
      maxChatbots: 500,
      maxTokens: 995000000,
      maxPages: 200,
      maxChunksPerPage: 100,
    },
  };

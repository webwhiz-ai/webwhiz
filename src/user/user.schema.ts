import { ObjectId } from 'mongodb';

/** **************************************************
 * TYPES
 *************************************************** */

export const USER_COLLECTION = 'users';

export enum Subscription {
  FREE = 'FREE',
  BASE_MONTHLY = 'BASE_MONTHLY',
  STANDARD_MONTHLY = 'STANDARD_MONTHLY',
  PREMIUM_MONTHLY = 'PREMIUM_MONTHLY',
  ENTERPRISE_MONTHLY = 'ENTERPRISE_MONTHLY',
  BASE_YEARLY = 'BASE_YEARLY',
  STANDARD_YEARLY = 'STANDARD_YEARLY',
  PREMIUM_YEARLY = 'PREMIUM_YEARLY',
  ENTERPRISE_YEARLY = 'ENTERPRISE_YEARLY',
  APPSUMO_TIER1 = 'APPSUMO_TIER1',
  APPSUMO_TIER2 = 'APPSUMO_TIER2',
  APPSUMO_TIER3 = 'APPSUMO_TIER3',
  DEMO_ACCOUNT = 'DEMO_ACCOUNT',
  SELF_HOSTED='SELF_HOSTED'
}

export interface UserMonthlyUsage {
  month: string;
  count: number;
}

export interface SubscriptionData {
  provider: 'lemonsqueezy';
  data: {
    subscriptionId: string;
    status: string;
    productId: number;
    variantId: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface User {
  _id?: ObjectId;
  email: string;
  password?: string;
  name?: string;
  avatarUrl?: string;
  locale?: string;
  // Sotres the usage (# messages) for current month
  monthUsage?: UserMonthlyUsage;
  // Subscription details
  activeSubscription: Subscription;
  subscriptionData?: SubscriptionData;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export type UserSparse = Pick<User, '_id' | 'email' | 'activeSubscription'>;

export type UserProfile = Pick<
  User,
  '_id' | 'email' | 'avatarUrl' | 'monthUsage' | 'activeSubscription'
>;

/** **************************************************
 * TYPES
 *************************************************** */

import { Subscription } from '../user/user.schema';

export enum LemonSqueezyWebhookEventName {
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_RESUMED = 'subscription_resumed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUBSCRIPTION_PAUSED = 'subscription_paused',
  SUBSCRIPTION_UNPAUSED = 'subscription_unpaused',
  ORDER_CREATED = 'order_created',
}

export enum LemonSqueezySubscriptionStatus {
  ON_TRIAL = 'on_trial',
  ACTIVE = 'active',
  PAUSED = 'paused',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface LemonSqueezySubscription {
  id: string;
  type: 'subscriptions';
  links: {
    self: string;
  };
  attributes: {
    urls: {
      update_payment_method: string;
    };
    pause: any;
    status: LemonSqueezySubscriptionStatus;
    ends_at: any;
    order_id: number;
    store_id: number;
    cancelled: boolean;
    renews_at: string;
    test_mode: boolean;
    user_name: string;
    created_at: string;
    product_id: number;
    updated_at: string;
    user_email: string;
    variant_id: number;
    product_name: string;
    variant_name: string;
    order_item_id: number;
    trial_ends_at: any;
    billing_anchor: number;
    status_formatted: string;
  };
}

export interface LemonSqueezyOrder {
  type: 'orders';
  id: string;
  attributes: {
    store_id: number;
    identifier: string;
    order_number: number;
    user_name: string;
    user_email: string;
    currency: string;
    currency_rate: string;
    subtotal: number;
    discount_total: number;
    tax: number;
    total: number;
    subtotal_usd: number;
    discount_total_usd: number;
    tax_usd: number;
    total_usd: number;
    tax_name: string;
    tax_rate: string;
    status: string;
    status_formatted: string;
    refunded: number;
    refunded_at: any;
    subtotal_formatted: string;
    discount_total_formatted: string;
    tax_formatted: string;
    total_formatted: string;
    first_order_item: {
      id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      price: number;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
    };
    created_at: string;
    updated_at: string;
  };
}

export interface LemonSqueezyWebhookSubscriptionCreatedEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.SUBSCRIPTION_CREATED;
  };
  data: LemonSqueezySubscription;
}

export interface LemonSqueezyWebhookSubscriptionCancelledEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.SUBSCRIPTION_CANCELLED;
  };
  data: LemonSqueezySubscription;
}

export interface LemonSqueezyWebhookSubscriptionResumedEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.SUBSCRIPTION_RESUMED;
  };
  data: LemonSqueezySubscription;
}

export interface LemonSqueezyWebhookSubscriptionExpiredEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.SUBSCRIPTION_EXPIRED;
  };
  data: LemonSqueezySubscription;
}

export interface LemonSqueezyWebhookSubscriptionPausedEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.SUBSCRIPTION_PAUSED;
  };
  data: LemonSqueezySubscription;
}

export interface LemonSqueezyWebhookSubscriptionUnpausedEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.SUBSCRIPTION_UNPAUSED;
  };
  data: LemonSqueezySubscription;
}

export interface LemonSqueezyWebhookOrderCreatedEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventName.ORDER_CREATED;
  };
  data: LemonSqueezyOrder;
}

const VARIANT_TO_SUBSCRIPTION_MAP: Record<number, Subscription> = {
  51438: Subscription.BASE_MONTHLY,
  51439: Subscription.STANDARD_MONTHLY,
  51440: Subscription.PREMIUM_MONTHLY,
  51714: Subscription.ENTERPRISE_MONTHLY,
  51713: Subscription.BASE_YEARLY,
  51715: Subscription.STANDARD_YEARLY,
  51718: Subscription.PREMIUM_YEARLY,
  68062: Subscription.ENTERPRISE_YEARLY,
};

const LTD_VARIANT_ID = 97685;

export function getSubscriptionPlanFromVariantId(
  variantId: number,
): Subscription | undefined {
  if (variantId in VARIANT_TO_SUBSCRIPTION_MAP) {
    return VARIANT_TO_SUBSCRIPTION_MAP[variantId];
  }
  return undefined;
}

export function isVariantForLifeTimeDeals(variantId: number) {
  return variantId === LTD_VARIANT_ID;
}

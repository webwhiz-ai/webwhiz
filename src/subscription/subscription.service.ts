import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { AppConfigService } from '../common/config/appConfig.service';
import { Subscription, SubscriptionData } from '../user/user.schema';
import { UserService } from '../user/user.service';
import {
  getSubscriptionPlanFromVariantId,
  isVariantForLifeTimeDeals,
  LemonSqueezyWebhookEventName,
  LemonSqueezyWebhookOrderCreatedEvent,
  LemonSqueezyWebhookSubscriptionCreatedEvent,
  LemonSqueezyWebhookSubscriptionExpiredEvent,
} from './lemon-squeezy.types';

@Injectable()
export class SubscriptionService {
  private readonly logger: Logger;

  constructor(
    private appConfig: AppConfigService,
    private userService: UserService,
  ) {
    this.logger = new Logger(SubscriptionService.name);
  }

  private validateLemonSqueezyPayload(
    payload: any,
    signature: string,
  ): boolean {
    const secret = this.appConfig.get('lemonSqueezySignSecret');

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(payload).digest('hex'), 'utf8');
    const hash = Buffer.from(signature || '', 'utf8');

    if (!crypto.timingSafeEqual(digest, hash)) {
      return false;
    }

    return true;
  }

  async handleLemonSqueezyWebhookEvent(
    payload: any,
    signature: string,
    rawBody?: Buffer,
  ) {
    // Validate signature
    if (!this.validateLemonSqueezyPayload(rawBody, signature)) {
      this.logger.warn('Error validating payload signature', payload);
      return;
    }

    switch (payload.meta.event_name) {
      case LemonSqueezyWebhookEventName.ORDER_CREATED:
        this.orderCreatedHandler(payload);
        break;
      case LemonSqueezyWebhookEventName.SUBSCRIPTION_CREATED:
        this.subscriptionCreatedHandler(payload);
        break;
      case LemonSqueezyWebhookEventName.SUBSCRIPTION_EXPIRED:
        this.subscriptionExpiredHandler(payload);
        break;
    }
  }

  async orderCreatedHandler(payload: LemonSqueezyWebhookOrderCreatedEvent) {
    if (
      payload.data.attributes.first_order_item.product_name !== 'WebWhiz LTD'
    ) {
      return;
    }

    const email = payload.data.attributes.user_email;

    let plan;
    // Check if the variant id is for App Sumo Life Time Deals
    if (
      isVariantForLifeTimeDeals(
        payload.data.attributes.first_order_item.variant_id,
      )
    ) {
      // For LTD the Plan is based on how many times the variant was purchased
      // Eg. New user purchases Variant -> Tier 1
      //     Tier 1 user purchases Variant -> Tier 2
      //     Tier 2 user purchases Variant -> Tier 3
      const userData = await this.userService.getUserByEmail(email);
      if (!userData) return;
      if (userData.activeSubscription === Subscription.FREE) {
        plan = Subscription.APPSUMO_TIER1;
      } else if (userData.activeSubscription === Subscription.APPSUMO_TIER1) {
        plan = Subscription.APPSUMO_TIER2;
      } else if (userData.activeSubscription === Subscription.APPSUMO_TIER2) {
        plan = Subscription.APPSUMO_TIER3;
      } else if (userData.activeSubscription === Subscription.APPSUMO_TIER3) {
        plan = Subscription.APPSUMO_TIER3;
      }
    }

    const data: SubscriptionData = {
      provider: 'lemonsqueezy',
      data: {
        subscriptionId: payload.data.id,
        productId: payload.data.attributes.first_order_item.product_id,
        variantId: payload.data.attributes.first_order_item.variant_id,
        status: payload.data.attributes.status,
        createdAt: payload.data.attributes.created_at,
        updatedAt: payload.data.attributes.updated_at,
      },
    };
    this.logger.log(
      `subscription_created hook called for ${email}, variant: ${payload.data.attributes.first_order_item.variant_id}, plan: ${plan}`,
    );
    await this.userService.setUserSubscription(email, plan, data);
  }

  async subscriptionCreatedHandler(
    payload: LemonSqueezyWebhookSubscriptionCreatedEvent,
  ) {
    const email = payload.data.attributes.user_email;

    const plan = getSubscriptionPlanFromVariantId(
      payload.data.attributes.variant_id,
    );

    const data: SubscriptionData = {
      provider: 'lemonsqueezy',
      data: {
        subscriptionId: payload.data.id,
        productId: payload.data.attributes.product_id,
        variantId: payload.data.attributes.variant_id,
        status: payload.data.attributes.status,
        createdAt: payload.data.attributes.created_at,
        updatedAt: payload.data.attributes.updated_at,
      },
    };
    this.logger.log(
      `subscription_created hook called for ${email}, variant: ${payload.data.attributes.variant_id}, plan: ${plan}`,
    );
    await this.userService.setUserSubscription(email, plan, data);
  }

  async subscriptionExpiredHandler(
    payload: LemonSqueezyWebhookSubscriptionExpiredEvent,
  ) {
    const email = payload.data.attributes.user_email;
    const plan = Subscription.FREE;
    const data: SubscriptionData = {
      provider: 'lemonsqueezy',
      data: {
        subscriptionId: payload.data.id,
        productId: payload.data.attributes.product_id,
        variantId: payload.data.attributes.variant_id,
        status: payload.data.attributes.status,
        createdAt: payload.data.attributes.created_at,
        updatedAt: payload.data.attributes.updated_at,
      },
    };
    this.logger.log(
      `subscription_expired hook called for ${email}, variant: ${payload.data.attributes.variant_id}`,
    );
    await this.userService.setUserSubscription(email, plan, data);
  }
}

import { Injectable } from '@nestjs/common';
import { Subscription } from '../user/user.schema';
import {
  subscriptionPlanData,
  SubscriptionPlanInfo,
} from './subscription.const';

@Injectable()
export class SubscriptionPlanInfoService {
  getSubscriptionPlanInfo(plan: Subscription): SubscriptionPlanInfo {
    return subscriptionPlanData[plan];
  }
}

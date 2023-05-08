import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { LemonSqueezyController } from './lemon-squeezy.controller';
import { SubscriptionPlanInfoService } from './subscription-plan.service';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [SubscriptionService, SubscriptionPlanInfoService],
  controllers: [LemonSqueezyController],
  exports: [SubscriptionPlanInfoService],
})
export class SubscriptionModule {}

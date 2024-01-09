import { forwardRef, Module } from '@nestjs/common';
import { MongoModule } from '../common/mongo/mongo.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ApikeyController } from './apikey/apikey.controller';
import { ApikeyService } from './apikey/apikey.service';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongoModule, forwardRef(() => SubscriptionModule)],
  controllers: [UsersController, ApikeyController],
  providers: [UserService, ApikeyService],
  exports: [UserService],
})
export class UserModule {}

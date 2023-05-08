import { forwardRef, Module } from '@nestjs/common';
import { MongoModule } from '../common/mongo/mongo.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongoModule, forwardRef(() => SubscriptionModule)],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

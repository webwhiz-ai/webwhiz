import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KbEmbeddings } from '../common/entity/kbEmbeddings.entity';
import { MongoModule } from '../common/mongo/mongo.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ApikeyController } from './apikey/apikey.controller';
import { ApikeyService } from './apikey/apikey.service';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

@Module({
  // TODO: Check why TypeOrmModule.forFeature is required here
  imports: [
    MongoModule,
    forwardRef(() => SubscriptionModule),
    TypeOrmModule.forFeature([KbEmbeddings]),
  ],
  controllers: [UsersController, ApikeyController],
  providers: [UserService, ApikeyService],
  exports: [UserService],
})
export class UserModule { }

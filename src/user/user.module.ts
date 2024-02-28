import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KbEmbeddings } from '../common/entity/kbEmbeddings.entity';
import { MongoModule } from '../common/mongo/mongo.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

@Module({
  // TODO: Check why TypeOrmModule.forFeature is required here
  imports: [
    MongoModule,
    forwardRef(() => SubscriptionModule),
    TypeOrmModule.forFeature([KbEmbeddings]),
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

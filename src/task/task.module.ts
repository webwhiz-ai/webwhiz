import { Module } from '@nestjs/common';
import { MongoModule } from '../common/mongo/mongo.module';
import { TaskService } from './task.service';

@Module({
  imports: [MongoModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}

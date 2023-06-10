import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { TASK_COLLECTION, Task } from './task.schema';
import { MONGODB } from '../common/mongo/mongo.module';

@Injectable()
export class TaskService {
  private readonly taskCollection: Collection<Task>;

  constructor(@Inject(MONGODB) private db: Db) {
    this.taskCollection = this.db.collection<Task>(TASK_COLLECTION);
  }

  async insertTask(task: Task) {
    const res = await this.taskCollection.insertOne(task);

    return {
      _id: res.insertedId,
      ...task,
    };
  }

  async getTaskById(id: ObjectId): Promise<Task> {
    const res = await this.taskCollection.findOne({ _id: id });
    return res;
  }

  async getTaskByName(name: string): Promise<Task> {
    const res = await this.taskCollection.findOne({ name });
    return res;
  }
}

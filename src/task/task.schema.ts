import { ObjectId } from 'mongodb';

export const TASK_COLLECTION = 'task';

export enum TaskType {
  EMAIL = 'EMAIL',
}

export interface Task {
  _id?: ObjectId;
  name: string;
  type: TaskType;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
}

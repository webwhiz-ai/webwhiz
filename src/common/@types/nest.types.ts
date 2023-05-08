import { Request } from 'express';
import { User } from '../../user/user.schema';

type RequestWithUser = Request & { user: User };

interface CursorPaginatedResponse<T> {
  results: T[];
  count: number;
  before?: string;
  after?: string;
}

interface LimitOffsetPaginatedReponse<T> {
  results: T[];
  pages: number;
}

export type {
  RequestWithUser,
  CursorPaginatedResponse,
  LimitOffsetPaginatedReponse,
};

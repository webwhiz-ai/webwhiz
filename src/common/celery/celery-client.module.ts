import { Module } from '@nestjs/common';
import { createClient } from 'celery-node';

export const CELERY_CLIENT = 'CELERY_CLIENT';

export type CeleryClient = ReturnType<typeof createClient>;

export enum CeleryClientQueue {
  DEFAULT = 'celery',
  CRAWLER = 'crawler',
}

export class CeleryClientService {
  private clientCache: Partial<Record<CeleryClientQueue, CeleryClient>>;

  constructor() {
    this.clientCache = {};
  }

  get(queue: CeleryClientQueue): CeleryClient {
    if (this.clientCache[queue] === undefined) {
      this.clientCache[queue] = createClient('redis://', 'redis://', queue);
    }
    return this.clientCache[queue];
  }
}

@Module({
  providers: [
    {
      provide: CELERY_CLIENT,
      useClass: CeleryClientService,
    },
  ],
  exports: [CELERY_CLIENT],
})
export class CeleryClientModule {}

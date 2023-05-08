import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/appConfig.service';
import { Redis } from 'ioredis';

export const REDIS = 'REDIS';

@Module({
  providers: [
    {
      provide: REDIS,
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService): Redis => {
        try {
          const client = new Redis();
          return client;
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}

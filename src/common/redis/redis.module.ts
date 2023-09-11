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
          const redisUrl = appConfig.get('redisUrl');
          let client: Redis;
          if (redisUrl) {
            client = new Redis(redisUrl);
          } else {
            client = new Redis({
              host: appConfig.get('redisHost'),
              port: appConfig.get('redisPort'),
            });
          }
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

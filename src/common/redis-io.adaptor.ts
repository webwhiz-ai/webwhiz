import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { AppConfigService } from './config/appConfig.service';
import { createClient } from 'redis';
import { INestApplicationContext } from '@nestjs/common';
import { REDIS } from './redis/redis.module';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private appConfig: AppConfigService;

  constructor(private app: INestApplicationContext) {
    super();
    this.appConfig = app.get(AppConfigService);
    console.log('appConfig', this.appConfig);
  }
  // constructor(appConfig: AppConfigService) {
  //   super();
  //   this.appConfig = appConfig;
  // }

  async connectToRedis(): Promise<void> {
    //let redisUrl = this.appConfig.get('redisUrl');
    // console.log('Connecting to redis', process.env, app);

    const redisUrl = this.appConfig.get('redisUrl');

    const redis = this.app.get(REDIS);

    console.log('redis', redis);

    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    // await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

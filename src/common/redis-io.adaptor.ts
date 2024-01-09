import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    let redisUrl;
    if (process.env['REDIS_URL']) {
      redisUrl = process.env['REDIS_URL'];
    } else {
      redisUrl = `redis://${process.env['REDIS_HOST']}:${process.env['REDIS_PORT']}`;
    }
    console.log('Connecting to redis', redisUrl);

    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

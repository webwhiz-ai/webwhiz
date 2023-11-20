import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { REDIS } from '../../common/redis/redis.module';
import { ChatQueryAnswer } from '../knowledgebase.schema';
import { ChatbotService } from './chatbot.service';

const ONLINE_SESSIONS_REDIS_KEY = 'onlineSessions';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    @Inject(REDIS) private redis: Redis,
    private chatBotService: ChatbotService,
  ) {}
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer() server;

  afterInit() {
    this.logger.log('Websocket gateway initialized.');
  }

  async handleConnection(socket: Socket) {
    // A client has connected
    const query = socket.handshake.query;

    if (query.isAdmin) {
      this.logger.log('Admin joined joined ', query.id);
      // iterate all users from redis
      const onlineSessions = await this.redis.hgetall(
        ONLINE_SESSIONS_REDIS_KEY,
      );
      for (const sessionId in onlineSessions) {
        this.logger.log('joining user room', sessionId);
        socket.join(sessionId);
        // temp code
        socket.emit('user_assigned', sessionId);
      }
    } else {
      const sessionId: any = query.id;
      this.logger.log('New client joined ', sessionId);
      // set user in redis
      this.redis.hset(ONLINE_SESSIONS_REDIS_KEY, sessionId, 1);
      // join chat room
      socket.join(sessionId);
    }
  }

  async handleDisconnect(socket: Socket) {
    // A client has disconnected
    const query = socket.handshake.query;
    const sessionId: any = query.id;
    if (query.isAdmin) {
      this.logger.log('Admin disconnected ', query.id);
    } else {
      this.logger.log('Client disconnected ', query);
      // remove user from redis
      this.redis.hdel(ONLINE_SESSIONS_REDIS_KEY, sessionId);
    }
  }

  @SubscribeMessage('chat')
  async onChat(client: Socket, msgData: ChatQueryAnswer) {
    this.logger.log('New chat message ', msgData);

    client.to(msgData.sessionId).emit('chat', msgData);

    this.chatBotService.saveManualChat(msgData.sessionId, msgData);
  }
}

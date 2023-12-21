import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { ChatQueryAnswer } from './knowledgebase.schema';
import { AppConfigService } from '../common/config/appConfig.service';
import { ChatbotService } from './chatbot/chatbot.service';
import { OfflineMsgService } from './offline-msg/offline-msg.service';

const ONLINE_SESSIONS_REDIS_KEY = 'onlineSessions';
const ONLINE_ADMINS_REDIS_KEY = 'onlineAdmins';
const USER_SESSION_ADMIN_MAPPING_KEY = 'userSessionAdminMapping';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server;
  private readonly logger = new Logger(WebSocketChatGateway.name);
  private redisClient: Redis;

  constructor(
    private appConfig: AppConfigService,
    @Inject(forwardRef(() => ChatbotService))
    private chatbotService: ChatbotService,
    private offlineMsgService: OfflineMsgService,
  ) {
    const redisUrl = this.appConfig.get('redisUrl');

    if (redisUrl) {
      this.redisClient = new Redis(redisUrl);
    } else {
      this.redisClient = new Redis({
        host: this.appConfig.get('redisHost'),
        port: this.appConfig.get('redisPort'),
      });
    }
  }

  afterInit() {
    this.logger.log('Websocket gateway initialized.');
  }

  async handleConnection(socket: Socket) {
    // A client has connected
    const query = socket.handshake.query;
    const sessionId: any = query.id;

    if (query.isAdmin) {
      this.logger.log('Admin joined joined ', sessionId);
      // set online admins in redis
      this.redisClient.hset(ONLINE_ADMINS_REDIS_KEY, sessionId, 1);
      // join admin room
      socket.join(sessionId);
      // iterate all users from redis
      const onlineSessions = await this.redisClient.hgetall(
        ONLINE_SESSIONS_REDIS_KEY,
      );
      for (const userSessionId in onlineSessions) {
        socket.emit('user_assigned', userSessionId);
      }
    } else {
      this.logger.log('New client joined ', sessionId);
      // set user in redis
      this.redisClient.hset(ONLINE_SESSIONS_REDIS_KEY, sessionId, 1);
      // join chat room
      socket.join(sessionId);
      // assign admin // change this when we have multiple admins
      const onlineAdmins = await this.redisClient.hgetall(
        ONLINE_ADMINS_REDIS_KEY,
      );
      for (const adminId in onlineAdmins) {
        this.logger.log(`assign session ${sessionId} to admin ${adminId}`);
        this.redisClient.hset(
          USER_SESSION_ADMIN_MAPPING_KEY,
          sessionId,
          adminId,
        );
        socket.to(adminId).emit('user_assigned', sessionId);
      }
    }
  }

  async handleDisconnect(socket: Socket) {
    // A client has disconnected
    const query = socket.handshake.query;
    const sessionId: any = query.id;
    if (query.isAdmin) {
      // remove online admin from redis
      this.redisClient.hdel(ONLINE_ADMINS_REDIS_KEY, sessionId);
      this.logger.log('Admin disconnected ', query.id);
    } else {
      this.logger.log('Client disconnected ', query);
      // remove user from redis
      this.redisClient.hdel(ONLINE_SESSIONS_REDIS_KEY, sessionId);
    }
  }

  @SubscribeMessage('admin_chat')
  async onAdminChat(client: Socket, msgData: ChatQueryAnswer) {
    this.logger.log('New admin chat message ', msgData);

    client.to(msgData.sessionId).emit('user_chat', msgData);

    this.chatbotService.saveManualChat(msgData.sessionId, msgData);
  }

  @SubscribeMessage('user_chat')
  async onUserChat(client: Socket, msgData: ChatQueryAnswer) {
    this.logger.log('New user chat message ', msgData);

    const adminId = await this.redisClient.hget(
      USER_SESSION_ADMIN_MAPPING_KEY,
      msgData.sessionId,
    );
    if (adminId) {
      client.to(adminId).emit('admin_chat', msgData);
    }

    // save the chat in db
    const knowledgeBaseId = await this.chatbotService.saveManualChat(
      msgData.sessionId,
      msgData,
    );

    const onlineAdmins = await this.redisClient.hgetall(
      ONLINE_ADMINS_REDIS_KEY,
    );

    if (Object.keys(onlineAdmins).length === 0) {
      // send email if the admin is offline
      this.logger.log('No online admins online!!!!');
      this.offlineMsgService.sendEmailForOfflineManualMessage(
        knowledgeBaseId,
        msgData.msg,
      );
    }
  }
}

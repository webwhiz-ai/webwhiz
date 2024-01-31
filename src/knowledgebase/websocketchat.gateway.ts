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
    const knowledgeBaseId = query.knowledgeBaseId;

    if (query.isAdmin) {
      this.logger.log('Admin joined:', query);
      // set online admins in redis
      this.redisClient.hset(`onlineAdmins_${knowledgeBaseId}`, sessionId, 1);
      // join admin room
      socket.join(sessionId);
      // iterate all users from redis
      const onlineSessions = await this.redisClient.hgetall('onlineSessions');
      for (const userSessionId in onlineSessions) {
        socket.emit('user_assigned', userSessionId);
      }
    } else {
      this.logger.log('New client joined:', query);
      // set user in redis
      this.redisClient.hset('onlineSessions', sessionId, 1);
      // join chat room
      socket.join(sessionId);
      // assign admin // change this when we have multiple admins
      const onlineAdmins = await this.redisClient.hgetall(
        `onlineAdmins_${knowledgeBaseId}`,
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
      const knowledgeBaseId = query.knowledgeBaseId;
      // remove online admin from redis
      this.redisClient.hdel(`onlineAdmins_${knowledgeBaseId}`, sessionId);
      this.logger.log('Admin disconnected:', query);
    } else {
      this.logger.log('Client disconnected:', query);
      // remove user from redis
      this.redisClient.hdel('onlineSessions', sessionId);
    }
  }

  @SubscribeMessage('admin_chat')
  async onAdminChat(client: Socket, msgData: ChatQueryAnswer) {
    this.logger.log('New admin chat message:', msgData);

    client.to(msgData.sessionId).emit('user_chat', msgData);
    this.server.emit('chat_broadcast', msgData);

    this.chatbotService.saveManualChat(msgData.sessionId, msgData);
  }

  @SubscribeMessage('user_chat')
  async onUserChat(client: Socket, msgData: ChatQueryAnswer) {
    this.logger.log('New user chat message:', msgData);

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

    if (knowledgeBaseId) {
      const onlineAdmins = await this.redisClient.hgetall(
        `onlineAdmins_${knowledgeBaseId}`,
      );

      if (Object.keys(onlineAdmins).length === 0) {
        // send email if the admin is offline
        this.logger.log('No online admins online!!!!');
        this.offlineMsgService.sendEmailForOfflineManualMessage(
          knowledgeBaseId,
          msgData.msg,
        );
      }
    } else {
      // Chat session is not present
      // sending custom message to user for initiation a new session
      const msg = { type: 'SESSION_NOT_FOUND', msg: '', ts: new Date() };
      client.to(msgData.sessionId).emit('custom_message', msg);
    }
  }
}

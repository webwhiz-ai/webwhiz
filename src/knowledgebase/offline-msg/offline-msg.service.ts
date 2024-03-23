import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGODB } from '../../common/mongo/mongo.module';
import { UserSparse } from '../../user/user.schema';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import { NewOfflineMsgDTO } from './offline-msg.dto';
import { OfflineMessage, OFFLINE_MSG_COLLECTION } from './offline-msg.schema';
import { EmailService } from '../../common/email/email.service';
import { UserService } from '../../user/user.service';
import { getLimitOffsetPaginatedResponse } from 'src/common/utils';
import { WebhookService } from '../../webhook/webhook.service';
import { WebhookEventType } from '../../webhook/webhook.types';
import {
  checkUserPermissionForKb,
  UserPermissions,
} from '../knowledgebase-utils';

@Injectable()
export class OfflineMsgService {
  private readonly offlineMsgCollection: Collection<OfflineMessage>;
  private readonly logger = new Logger(OfflineMsgService.name);

  constructor(
    @Inject(MONGODB) private db: Db,
    private kbDbService: KnowledgebaseDbService,
    private userService: UserService,
    private emailService: EmailService,
    private readonly webhookService: WebhookService,
  ) {
    this.offlineMsgCollection = this.db.collection(OFFLINE_MSG_COLLECTION);
  }

  /*********************************************************
   * DB OPERATIONS
   *********************************************************/

  async insertOfflineMsg(data: NewOfflineMsgDTO): Promise<OfflineMessage> {
    const msg: OfflineMessage = {
      knowledgebaseId: new ObjectId(data.knowledgebaseId),
      chatSessionId: new ObjectId(data.sessionId),
      name: data.name,
      email: data.email,
      message: data.message,
      url: data.url,
      createdAt: new Date(),
    };

    const res = await this.offlineMsgCollection.insertOne(msg);

    return {
      _id: res.insertedId,
      ...msg,
    };
  }

  async getPaginatedOfflineMsgsForKnowledgebase(
    kbId: ObjectId,
    pageSize: number,
    page?: number,
  ) {
    const itemsPerPage = Math.min(pageSize, 50);

    const projectionFields = {
      _id: 1,
      chatSessionId: 1,
      name: 1,
      email: 1,
      message: 1,
      url: 1,
      createdAt: 1,
    };

    const filter = {
      knowledgebaseId: kbId,
    };

    const response = await getLimitOffsetPaginatedResponse(
      this.offlineMsgCollection,
      filter,
      projectionFields,
      '_id',
      -1,
      itemsPerPage,
      page,
    );

    return response;
  }

  /*********************************************************
   * APIS
   *********************************************************/

  /**
   * Add a new offline message
   * @param data
   * @returns
   */
  async createOfflineMessage(data: NewOfflineMsgDTO) {
    const kbId = new ObjectId(data.knowledgebaseId);
    const kb = await this.kbDbService.getKnowledgebaseById(kbId);
    if (!kb) {
      throw new HttpException('Invalid Knowledgebase', HttpStatus.NOT_FOUND);
    }

    // Choose email address to send this mail
    // If adminEmail field is set user that, else use owner email
    let email = '';
    if (kb.adminEmail) {
      email = kb.adminEmail;
    } else {
      // Get kb owner
      const kbOwner = await this.userService.findUserByIdSparse(
        kb.owner.toHexString(),
      );
      email = kbOwner.email;
    }

    // Insert offline msg
    const res = await this.insertOfflineMsg(data);

    // Send email
    await this.emailService.sendOfflineMsgEmail(
      email,
      kb.websiteData.websiteUrl,
      data.email,
      data.message,
      data.name,
    );

    // Call webhook with the offline msg
    this.webhookService.callWebhook(kb.owner, {
      event: WebhookEventType.OFFLINE_MSG,
      payload: {
        id: res._id.toHexString(),
        chatSessionId: res.chatSessionId.toHexString(),
        email: res.email,
        name: res.name,
        message: res.message,
        knowledgebaseId: res.knowledgebaseId.toHexString(),
        url: res.url,
        createdAt: res.createdAt,
      },
    });

    return res;
  }

  /**
   * Get paginated list of offline msgs
   * @param user
   * @param knowledgebaseId
   * @param pageSize
   * @param before
   * @param after
   * @returns
   */
  async getOfflineMsgsForKnowledgebase(
    user: UserSparse,
    knowledgebaseId: string,
    pageSize: number,
    page?: number,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    if (!kb) {
      throw new HttpException('Invalid Knowledgebase Id', HttpStatus.NOT_FOUND);
    }
    checkUserPermissionForKb(user, kb, [UserPermissions.READ]);

    return this.getPaginatedOfflineMsgsForKnowledgebase(kbId, pageSize, page);
  }

  async sendEmailForOfflineManualMessage(
    knowledgebaseId: ObjectId,
    sessionId: string,
    msg: string,
  ) {
    const kb = await this.kbDbService.getKnowledgebaseById(knowledgebaseId);
    if (!kb) {
      this.logger.error('Invalid Knowledgebase', knowledgebaseId);
      return;
    }

    // Choose email address to send this mail
    // If adminEmail field is set user that, else use owner email
    let email = '';
    if (kb.adminEmail) {
      email = kb.adminEmail;
    } else {
      // Get kb owner
      const kbOwner = await this.userService.findUserByIdSparse(
        kb.owner.toHexString(),
      );
      email = kbOwner.email;
    }

    // Send email
    await this.emailService.sendManualMsgEmail(
      email,
      msg,
      kb.websiteData.websiteUrl,
      knowledgebaseId,
      sessionId,
    );

    return;
  }
}

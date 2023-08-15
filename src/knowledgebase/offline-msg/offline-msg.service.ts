import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGODB } from '../../common/mongo/mongo.module';
import { UserSparse } from '../../user/user.schema';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import { NewOfflineMsgDTO } from './offline-msg.dto';
import { OfflineMessage, OFFLINE_MSG_COLLECTION } from './offline-msg.schema';
import { EmailService } from '../../common/email/email.service';
import { UserService } from '../../user/user.service';
import { getLimitOffsetPaginatedResponse } from 'src/common/utils';

@Injectable()
export class OfflineMsgService {
  private readonly offlineMsgCollection: Collection<OfflineMessage>;

  constructor(
    @Inject(MONGODB) private db: Db,
    private kbDbService: KnowledgebaseDbService,
    private userService: UserService,
    private emailService: EmailService,
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

    // Get kb owner
    const kbOwner = await this.userService.findUserByIdSparse(
      kb.owner.toHexString(),
    );

    // Insert offline msg
    const res = await this.insertOfflineMsg(data);

    // Send email
    await this.emailService.sendOfflineMsgEmail(
      kbOwner.email,
      kb.websiteData.websiteUrl,
      data.email,
      data.message,
      data.name,
    );

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
    if (!kb || !user._id.equals(kb.owner)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.getPaginatedOfflineMsgsForKnowledgebase(kbId, pageSize, page);
  }
}

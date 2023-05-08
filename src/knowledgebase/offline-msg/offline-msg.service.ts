import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGODB } from '../../common/mongo/mongo.module';
import { UserSparse } from '../../user/user.schema';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import { NewOfflineMsgDTO } from './offline-msg.dto';
import { OfflineMessage, OFFLINE_MSG_COLLECTION } from './offline-msg.schema';
import { EmailService } from '../../common/email/email.service';
import { UserService } from '../../user/user.service';

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
    before?: string,
    after?: string,
  ): Promise<OfflineMessage[]> {
    const itemsPerPage = Math.min(pageSize, 50);

    if (before) {
      const msgs = await this.offlineMsgCollection
        .find(
          {
            knowledgebaseId: kbId,
            _id: { $gt: new ObjectId(before) },
          },
          { limit: itemsPerPage, sort: { _id: -1 } },
        )
        .toArray();
      return msgs;
    }

    if (after) {
      const msgs = await this.offlineMsgCollection
        .find(
          {
            knowledgebaseId: kbId,
            _id: { $lt: new ObjectId(after) },
          },
          { limit: itemsPerPage, sort: { _id: -1 } },
        )
        .toArray();
      return msgs;
    }

    const msgs = await this.offlineMsgCollection
      .find(
        {
          knowledgebaseId: kbId,
        },
        { limit: itemsPerPage, sort: { _id: -1 } },
      )
      .toArray();
    return msgs;
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
    before?: string,
    after?: string,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseById(kbId);
    if (!user._id.equals(kb.owner)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.getPaginatedOfflineMsgsForKnowledgebase(
      kbId,
      pageSize,
      before,
      after,
    );
  }
}

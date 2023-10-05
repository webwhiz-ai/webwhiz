import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { AppConfigService } from '../common/config/appConfig.service';

@Injectable()
export class SlackTokenService {
  private readonly slackTokenCollection: Collection;

  constructor(
    private appConfig: AppConfigService,
    @Inject('MONGODB') private db: Db,
  ) {
    this.slackTokenCollection = this.db.collection('slackTokens');
  }

  /**
   * Save installation to database
   * @param installation
   */
  async saveInstallationToDatabase(installation: any) {
    console.log('installation: ', installation);
    const { teamId, enterpriseId, bot } = installation;
    await this.slackTokenCollection.insertOne({
      teamId,
      enterpriseId,
      bot,
    });
  }

  /**
   * Fetch installation from database
   * @param query
   */
  async fetchInstallationFromDatabase(query: any) {
    const { teamId, enterpriseId } = query;
    if (enterpriseId) {
      const result = await this.slackTokenCollection.findOne({ enterpriseId });
      return result.installation;
    }
    const result = await this.slackTokenCollection.findOne({ teamId });
    return result.installation;
  }

  /**
   * Delete installation from database
   * @param query
   */
  async deleteInstallationFromDatabase(query: any) {
    const { teamId, enterpriseId } = query;
    if (enterpriseId) {
      return await this.slackTokenCollection.deleteOne({ enterpriseId });
    }
    return await this.slackTokenCollection.deleteOne({ teamId });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';

@Injectable()
export class SlackTokenService {
  private readonly slackTokenCollection: Collection;

  constructor(@Inject('MONGODB') private db: Db) {
    this.slackTokenCollection = this.db.collection('slackTokens');
  }

  /**
   * Saves the installation data to the database for a specific team.
   * @param teamId The ID of the team.
   * @param installation The installation data to be saved.
   */
  async saveInstallationToDatabase(teamId: string, installation: any) {
    await this.slackTokenCollection.updateOne(
      { teamId },
      {
        $set: { installation, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  /**
   * Fetches the installation by team ID.
   * @param teamId The ID of the team.
   * @returns The installation object if found, otherwise undefined.
   */
  async fetchInstallationByTeamId(teamId: string) {
    const result = await this.slackTokenCollection.findOne({ teamId });
    return result?.installation;
  }

  /**
   * Deletes an installation by team ID.
   * @param teamId The ID of the team whose installation needs to be deleted.
   * @throws Error if no document is found with the specified teamId.
   */
  async deleteInstallationByTeamId(teamId: string) {
    const result = await this.slackTokenCollection.deleteOne({ teamId });
    if (result.deletedCount === 0) {
      throw new Error(`No document found with teamId: ${teamId}`);
    }
  }

  /**
   * Fetches the WebWhiz bot ID from the database for a given team ID.
   * @param teamId The ID of the team.
   * @returns The WebWhiz bot ID if found, otherwise null.
   */
  async fetchWebWhizBotIdFromDatabase(teamId: string) {
    const result = await this.slackTokenCollection.findOne({ teamId });
    return result && result.installation && result.installation.metadata
      ? result.installation.metadata
      : null;
  }
}

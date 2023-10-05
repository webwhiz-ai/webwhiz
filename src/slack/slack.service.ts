import { Inject } from '@nestjs/common';
import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import { Application } from 'express';
import { SlackTokenService } from './slack-token.service';
import { SlackBotService } from './slackbot.service';

export class SlackService {
  @Inject(SlackBotService)
  @Inject(SlackTokenService)
  private readonly slackbotService: SlackBotService;
  private readonly slackTokenSerivice: SlackTokenService;

  private boltApp: App;
  private readonly receiver: ExpressReceiver;

  constructor() {
    this.receiver = new ExpressReceiver({
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      endpoints: '/',
      logLevel: LogLevel.DEBUG,
    });

    // this.boltApp = new App({
    //   logLevel: LogLevel.DEBUG,
    //   token: process.env.SLACK_BOT_TOKEN,
    //   receiver: this.receiver,
    // });

    this.boltApp = new App({
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      logLevel: LogLevel.DEBUG,
      scopes: [
        'chat:write',
        'app_mentions:read',
        'channels:history',
        'im:history',
        'channels:read',
      ],
      installationStore: {
        storeInstallation: async (installation) => {
          // change the line below so it saves to your database
          console.log('installation: ', installation);
          if (
            installation.isEnterpriseInstall &&
            installation.enterprise !== undefined
          ) {
            // support for org wide app installation
            // return await database.set(installation.enterprise.id, installation);
            return await this.slackTokenSerivice.saveInstallationToDatabase(
              installation,
            );
          }
          if (installation.team !== undefined) {
            // single team app installation
            // return await database.set(installation.team.id, installation);
            const rep =
              await this.slackTokenSerivice.saveInstallationToDatabase(
                installation,
              );
            return rep;
          }
          throw new Error(
            'Failed saving installation data to installationStore',
          );
        },
        fetchInstallation: async (installQuery) => {
          // change the line below so it fetches from your database
          if (
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
          ) {
            // org wide app installation lookup
            // return await database.get(installQuery.enterpriseId);
            return await this.slackTokenSerivice.fetchInstallationFromDatabase({
              enterpriseId: installQuery.enterpriseId,
            });
          }
          if (installQuery.teamId !== undefined) {
            // single team app installation lookup
            // return await database.get(installQuery.teamId);
            return await this.slackTokenSerivice.fetchInstallationFromDatabase({
              teamId: installQuery.teamId,
            });
          }
          throw new Error('Failed fetching installation');
        },
        deleteInstallation: async (installQuery) => {
          // change the line below so it deletes from your database
          if (
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
          ) {
            // org wide app installation deletion
            // return await database.delete(installQuery.enterpriseId);
          }
          if (installQuery.teamId !== undefined) {
            // single team app installation deletion
            // return await database.delete(installQuery.teamId);
          }
          throw new Error('Failed to delete installation');
        },
      },
      // receiver: this.receiver,
      installerOptions: {
        stateVerification: false,
        installPath: 'slack/install',
      },
      // authorize: async ({ teamId, enterpriseId }) => {
      //   // Fetch installation data from your database and return an object that includes botToken
      //   const installation =
      //     await this.slackTokenSerivice.fetchInstallationFromDatabase({
      //       teamId,
      //       enterpriseId,
      //     });
      //   if (installation) {
      //     return {
      //       botToken: installation.bot.token,
      //       botId: installation.bot.id,
      //       botUserId: installation.bot.userId,
      //     };
      //   } else {
      //     throw new Error('No matching authorizations');
      //   }
      // },
    });

    this.boltApp.message('hello', async ({ message, say }) => {
      console.log(message);
      await say(`Hey there <@${message['user']}>!`);
    });

    this.boltApp.event('app_mention', this.onAppMention.bind(this));
  }

  public async onAppMention({ event, say, logger, client }) {
    try {
      console.log(event);
      this.slackbotService.botProcess(event, say, client);
    } catch (error) {
      logger.error(error);
    }
  }

  public use(): Application {
    return this.receiver.app;
  }
}

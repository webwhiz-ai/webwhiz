import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel } from '@slack/bolt';
import { NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { KnowledgebaseDbService } from '../knowledgebase/knowledgebase-db.service';
import { SlackTokenService } from './slack-token.service';
import { SlackBotService } from './slackbot.service';

@Injectable()
export class SlackBoltMiddleware implements NestMiddleware {
  private appRunner: AppRunner;
  private webwhizbotIdStore: any = {
    data: {},
    set: function (key, value) {
      this.data[key] = value;
    },
    get: function (key) {
      return this.data[key];
    },
  };

  public constructor(
    private readonly slackBotService: SlackBotService,
    private readonly slackTokenService: SlackTokenService,
    private readonly kbDbService: KnowledgebaseDbService,
  ) {
    const runner = new AppRunner({
      logLevel: LogLevel.DEBUG,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      scopes: ['chat:write', 'app_mentions:read', 'im:history', 'im:read'],
      installationStore: {
        storeInstallation: async (installation) => {
          console.log('installation: ', installation);
          if (
            installation.isEnterpriseInstall &&
            installation.enterprise !== undefined
          ) {
            // handle storing org-wide app installation
            return await this.slackTokenService.saveInstallationToDatabase(
              installation.enterprise.id,
              installation,
            );
          }
          if (installation.team !== undefined) {
            // single team app installation
            return await this.slackTokenService.saveInstallationToDatabase(
              installation.team.id,
              installation,
            );
          }
          throw new Error(
            'Failed saving installation data to installationStore',
          );
        },
        fetchInstallation: async (installQuery) => {
          console.log('installQuery: ', installQuery);
          if (
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
          ) {
            // handle org wide app installation lookup
            return await slackTokenService.fetchInstallationByTeamId(
              installQuery.enterpriseId,
            );
          }
          if (installQuery.teamId !== undefined) {
            // single team app installation lookup
            return await slackTokenService.fetchInstallationByTeamId(
              installQuery.teamId,
            );
          }
          throw new Error('Failed fetching installation');
        },
        deleteInstallation: async (installQuery) => {
          console.log('installQuery: ', installQuery);
          if (
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
          ) {
            // org wide app installation deletion
            return await slackTokenService.deleteInstallationByTeamId(
              installQuery.enterpriseId,
            );
          }
          if (installQuery.teamId !== undefined) {
            // single team app installation deletion
            return await slackTokenService.deleteInstallationByTeamId(
              installQuery.teamId,
            );
          }
          throw new Error('Failed to delete installation');
        },
      },
      installerOptions: {
        stateVerification: false,
        installPathOptions: {
          beforeRedirection: async (req, res) => {
            const webwhizbotId = req.url.split('webwhizKbId=')[1];
            console.log('beforeRedirection: webwhizKbId: ', webwhizbotId);
            if (
              webwhizbotId &&
              (await this.isValidKnowledgebase(webwhizbotId))
            ) {
              this.webwhizbotIdStore.set('webwhizKbId', webwhizbotId);
              return true;
            } else {
              return false;
            }
          },
        },
        callbackOptions: {
          afterInstallation: async (installation, req, res) => {
            const webwhizbotId = this.webwhizbotIdStore.get('webwhizKbId');
            console.log('afterInstallation: webwhizKbId: ', webwhizbotId);
            if (webwhizbotId) {
              installation.metadata = webwhizbotId;
              return true;
            } else {
              return false;
            }
          },
        },
      },
    });

    const app = new App(runner.appOptions());

    app.message('hello', async ({ say }) => {
      await say(`Hey there`);
    });

    app.event('app_mention', this.onAppMention.bind(this));

    runner.setup(app);
    this.appRunner = runner;
  }
  async isValidKnowledgebase(webwhizbotId: string) {
    let kbId;
    try {
      kbId = new ObjectId(webwhizbotId);
    } catch (e) {
      console.log('Error: ', e);
      return false;
    }
    const kbData = await this.kbDbService.getKnowledgebaseById(kbId);
    return !!kbData;
  }

  private async onAppMention({ event, say, client }) {
    this.slackBotService.botProcessAppMention(event, say, client);
  }

  async use(req: IncomingMessage, res: ServerResponse, next: NextFunction) {
    const { pathname: path } = new URL(req.url as string, 'http://localhost');
    if (req.method === 'POST' && path === '/slack/events') {
      await this.appRunner.handleEvents(req, res);
    } else if (req.method === 'GET' && path === '/slack/install') {
      await this.appRunner.handleInstallPath(req, res);
    } else if (req.method === 'GET' && path === '/slack/oauth_redirect') {
      await this.appRunner.handleCallback(req, res);
    } else {
      next();
    }
  }
}

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
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
  private readonly logger: Logger;
  private appRunner: AppRunner;

  public constructor(
    private readonly slackBotService: SlackBotService,
    private readonly slackTokenService: SlackTokenService,
    private readonly kbDbService: KnowledgebaseDbService,
  ) {
    this.logger = new Logger(SlackBoltMiddleware.name);
    const runner = new AppRunner({
      // logLevel: LogLevel.DEBUG,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      scopes: ['chat:write', 'app_mentions:read', 'im:history', 'im:read'],
      installationStore: {
        storeInstallation: async (installation) => {
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
          this.logger.error('Failed to save installation in db');
          throw new Error(
            'Failed saving installation data to installationStore',
          );
        },
        fetchInstallation: async (installQuery) => {
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
          this.logger.error('Failed to fetch installation from db');
          throw new Error('Failed fetching installation');
        },
        deleteInstallation: async (installQuery) => {
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
          this.logger.error('Failed to delete installation from db');
          throw new Error('Failed to delete installation');
        },
      },
      installerOptions: {
        stateVerification: false,
        installPathOptions: {
          beforeRedirection: async (req, res) => {
            // console.log('beforeRedirection');
            const webwhizbotId = req.url.split('webwhizKbId=')[1];
            this.logger.log(`webwhizKbId: ${webwhizbotId}`);
            if (
              webwhizbotId &&
              (await this.isValidKnowledgebase(webwhizbotId))
            ) {
              // Set webwhizKbId as cookie with expiry of 5 minutes
              const d = new Date();
              d.setTime(d.getTime() + 5 * 60 * 1000); // 5 minutes in milliseconds
              const expires = 'expires=' + d.toUTCString();
              res.setHeader(
                'Set-Cookie',
                `webwhizKbId=${webwhizbotId}; ${expires}; path=/;`,
              );
              return true;
            } else {
              return false;
            }
          },
        },
        callbackOptions: {
          beforeInstallation: async (options, req, res) => {
            // console.log('beforeInstallation');
            const cookie = req.headers.cookie;
            // console.log('cookie before removal', cookie);
            // remove webwhizKbId from cookie
            res.setHeader(
              'Set-Cookie',
              'webwhizKbId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
            const regex = /webwhizKbId=([a-zA-Z0-9]+)/; // Regular expression to match the botid value
            const match = cookie.match(regex);
            let webwhizbotId;
            if (match) {
              webwhizbotId = match[1];
            }
            if (webwhizbotId) {
              options.metadata = webwhizbotId;
              return true;
            }
            return false;
          },
        },
      },
    });

    const app = new App(runner.appOptions());

    app.event('message', this.onAppMention.bind(this));

    app.event('app_mention', this.onAppMention.bind(this));

    app.event('app_uninstalled', async ({ event, logger, context }) => {
      try {
        if (context.isEnterpriseInstall && context.enterpriseId !== undefined) {
          // org wide app installation deletion
          return await slackTokenService.deleteInstallationByTeamId(
            context.enterpriseId,
          );
        }
        if (context.teamId !== undefined) {
          // single team app installation deletion
          return await slackTokenService.deleteInstallationByTeamId(
            context.teamId,
          );
        }
      } catch (error) {
        logger.error(
          'Error while deleting slack installation data' + error.message,
        );
      }
    });

    runner.setup(app);
    this.appRunner = runner;
  }
  async isValidKnowledgebase(webwhizbotId: string) {
    let kbId;
    try {
      kbId = new ObjectId(webwhizbotId);
    } catch (e) {
      this.logger.error('Invalid knowledgebase id: ' + webwhizbotId);
      return false;
    }
    const kbData = await this.kbDbService.getKnowledgebaseById(kbId);
    return !!kbData;
  }

  private async onAppMention({ event, say, client }) {
    // Ignore message_changed events
    if (event.channel_type === 'im' && event.subtype === 'message_changed') {
      return;
    }
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

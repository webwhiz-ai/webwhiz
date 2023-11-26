import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel } from '@slack/bolt';
import { NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { SlackTokenService } from './slack/slack-token.service';
import { SlackBotService } from './slack/slackbot.service';

@Injectable()
export class SlackBoltMiddleware implements NestMiddleware {
  private appRunner: AppRunner;
  private customDataStore: any = {
    data: {},
    set: function (key, value) {
      this.data[key] = value;
    },
    get: function (key) {
      return this.data[key];
    },
  };

  public constructor(
    private slackTokenSerivice: SlackTokenService,
    private slackBotService: SlackBotService,
  ) {
    const runner = new AppRunner({
      logLevel: LogLevel.DEBUG,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      scopes: ['commands', 'chat:write', 'app_mentions:read'],
      installationStore: {
        storeInstallation: async (installation) => {
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
          console.log('fetchInstallation: ', installQuery);
          if (
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
          ) {
            // org wide app installation lookup
            return await this.slackTokenSerivice.fetchInstallationFromDatabase({
              enterpriseId: installQuery.enterpriseId,
            });
          }
          if (installQuery.teamId !== undefined) {
            // single team app installation lookup
            console.log('teamId: ', installQuery.teamId);
            let result = null;
            try {
              result =
                await this.slackTokenSerivice.fetchInstallationFromDatabase({
                  teamId: installQuery.teamId,
                });
            } catch (error) {
              console.log('error: ', error);
            }
            console.log('result: ', result);
            return result;
          }
          console.log('Failed fetching installation');
          throw new Error('Failed fetching installation');
        },
        deleteInstallation: async (installQuery) => {
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
      installerOptions: {
        directInstall: true,
        stateVerification: false,
        metadata: 'some session data',
        installPathOptions: {
          beforeRedirection: async (req, res) => {
            const webwhizBotId = req.url.split('botId=')[1];
            this.customDataStore.set('botId', webwhizBotId);
            console.log('beforeRedirection: botId: ', webwhizBotId);
            if (webwhizBotId) {
              res.setHeader('Cookie', `myServiceUserID=${webwhizBotId}`);
              console.log('beforeRedirection: res.headers: ', res.getHeaders());
              return true;
            } else {
              return false;
            }
          },
        },
        callbackOptions: {
          beforeInstallation: async (opts, req, res) => {
            console.log('beforeInstallation: opts: ', opts);
            console.log('beforeInstallation: res: ', res.getHeaders());
            console.log('beforeInstallation: req.headers: ', req.headers);
            const botId = req.headers.cookie.split('myServiceUserID=')[1];
            console.log('beforeInstallation: botId: ', botId);
            // if (botId) {
            //   opts.metadata = botId;
            //   return true;
            // } else {
            //   return false;
            // }
            return true;
          },
          afterInstallation: async (
            installation,
            installUrlOptions,
            req,
            res,
          ) => {
            // console.log('installation: ', installation);
            // console.log('req: ', req);
            // console.log('res: ', res);
            console.log(
              'res.headers in afterInstallation : ',
              res.getHeaders(),
            );
            const botId = this.customDataStore.get('botId');
            console.log('afterInstallation: botId: ', botId);
            console.log('req: ', req.headers);
            // const botId = req.headers.cookie.split('myServiceUserID=')[1];
            console.log('botId: ', botId);
            if (botId) {
              installation.metadata = botId;
              // await this.slackTokenSerivice.saveInstallationToDatabase(
              //   installation,
              // );
              return true;
            } else {
              return false;
            }
          },
        },
      },
    });

    const app = new App(runner.appOptions());

    app.event('app_mention', this.onAppMention.bind(this));

    app.message('hello', async ({ message, say }) => {
      console.log('message: ', message);
      await say(`Hey there!`);
    });

    runner.setup(app);
    this.appRunner = runner;
  }

  public async onAppMention({ event, say, logger, client, context }) {
    console.log('dataStore: ', this.customDataStore);
    try {
      console.log('event: ', event);
      console.log('context: ', context);
      this.slackBotService.botProcess(event, say, client, context);
    } catch (error) {
      logger.error(error);
    }
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

import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel, FileInstallationStore } from '@slack/bolt';
import { NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { SlackBotService } from './slackbot.service';

@Injectable()
export class SlackBoltMiddleware implements NestMiddleware {
  private appRunner: AppRunner;

  public constructor(private readonly slackBotService: SlackBotService) {
    console.log('bot token: ', process.env.SLACK_BOT_TOKEN);
    const runner = new AppRunner({
      logLevel: LogLevel.DEBUG,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      scopes: ['chat:write', 'app_mentions:read', 'im:history', 'im:read'],
      installationStore: new FileInstallationStore(),
      // TODO: Implement installationStore
      installerOptions: {
        stateVerification: false,
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

import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import { WebhookEvent } from './webhook.types';
import * as crypto from 'node:crypto';

@Injectable()
export class WebhookService {
  private readonly logger: Logger;

  constructor(private readonly userService: UserService) {
    this.logger = new Logger(WebhookService.name);
  }

  /**
   * Register and save user webhook data
   * @param user .
   * @param webhookUrl .
   * @param signingSecret .
   */
  async registerWebhook(
    userId: ObjectId,
    webhookUrl: string,
    signingSecret: string,
  ) {
    await this.userService.setUserWebhookData(userId, {
      url: webhookUrl,
      secret: signingSecret,
    });
  }

  /**
   * Call the users registered web hook with the given payload
   * @param user .
   * @param payload
   */
  async callWebhook(userId: ObjectId, payload: WebhookEvent) {
    const webhookData = await this.userService.getUserWebhookData(userId);
    if (!webhookData.webhook) return;

    // Call webhook with given payload
    const hmac = crypto.createHmac('sha256', webhookData.webhook.secret);
    hmac.update(JSON.stringify(payload));
    const digest = hmac.digest('hex');

    try {
      await axios.post(webhookData.webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Payload-Digest': digest,
        },
      });
    } catch (e) {
      this.logger.error(`Webhook call for user ${userId} failed`, e);
    }
  }
}

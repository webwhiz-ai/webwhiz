import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import { WebhookEvent } from './webhook.types';
import * as crypto from 'node:crypto';
import { WebhookDTO } from './webhook.dto';
import { WebhookData } from '../user/user.schema';

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
   * Register and save user webhook data
   * @param user .
   * @param webhookUrl .
   */
  async registerNewWebhook(userId: ObjectId, webhookdto: WebhookDTO) {
    // validate webhook url
    try {
      const url = new URL(webhookdto.url);
      if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
        throw new HttpException('Invalid webhook url', HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      throw new HttpException('Invalid webhook url', HttpStatus.BAD_REQUEST);
    }

    const webhookData: WebhookData = {
      id: new ObjectId(),
      url: webhookdto.url,
    };
    if (webhookdto.signingSecret) {
      webhookData.secret = webhookdto.signingSecret;
    }
    return await this.userService.addNewWebhook(userId, webhookData);
  }

  /**
   * Delete a webhook for user
   * @param user .
   * @param webhookId .
   */
  async deleteWebhookForUser(userId: ObjectId, id: string) {
    let webhookId: ObjectId;
    try {
      webhookId = new ObjectId(id);
    } catch (e) {
      throw new HttpException('Invalid webhook id', HttpStatus.BAD_REQUEST);
    }
    return await this.userService.deleteWebhook(userId, webhookId);
  }

  /**
   * Call the user registered web-hooks with the given payload
   * @param user .
   * @param payload
   */
  async callWebhook(userId: ObjectId, payload: WebhookEvent) {
    const webhooksData = await this.userService.getUserWebhooksData(userId);

    if (!webhooksData.webhooks || webhooksData.webhooks.length === 0) return;

    // Call each webhooks with given payload
    webhooksData.webhooks.forEach(async (webhookData) => {
      let digest = '';
      if (webhookData.secret) {
        // If webhook has a secret, use it to sign the payload
        const hmac = crypto.createHmac('sha256', webhookData.secret);
        hmac.update(JSON.stringify(payload));
        digest = hmac.digest('hex');
      }
      try {
        await axios.post(webhookData.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Payload-Digest': digest,
          },
        });
      } catch (e) {
        this.logger.error(
          `Webhook call to url ${webhookData.url} for user ${userId} failed`,
          e,
        );
      }
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { AppConfigService } from '../config/appConfig.service';

@Injectable()
export class EmailService {
  private readonly logger: Logger;

  constructor(private appConfig: AppConfigService) {
    this.logger = new Logger(EmailService.name);

    const sendGridApiKey = this.appConfig.get('sendGridApiKey');
    sgMail.setApiKey(sendGridApiKey);
  }

  async sendWelcomeEmail(email: string, username?: string) {
    const msg = {
      to: email,
      from: { email: 'hi@webwhiz.ai', name: 'WebWhiz.ai' },
      templateId: 'd-4ba3b2bf1f9e4fcea8c5e881c934a2c6',
      dynamicTemplateData: {
        username,
      },
    };

    const res = await sgMail.send(msg);
    return res;
  }

  async sendOfflineMsgEmail(
    email: string,
    websiteUrl: string,
    queryEmail: string,
    queryText: string,
    queryName?: string,
  ) {
    const msg = {
      to: email,
      from: { email: 'hi@webwhiz.ai', name: 'WebWhiz.ai' },
      replyTo: queryEmail,
      templateId: 'd-a4f34375b9504c5d94f6d9e3eafe0214',
      dynamicTemplateData: {
        website_url: websiteUrl,
        msg_email: queryEmail,
        msg_name: queryName || 'NA',
        msg_msg: queryText,
      },
    };

    const res = await sgMail.send(msg);
    return res;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { AppConfigService } from '../config/appConfig.service';

@Injectable()
export class EmailService {
  private readonly logger: Logger;
  private isSgInitialized: boolean;
  private senderEmail: string;
  private senderName: string;
  private clientUrl: string;

  constructor(private appConfig: AppConfigService) {
    this.logger = new Logger(EmailService.name);

    this.senderEmail = this.appConfig.get('senderEmail');
    this.senderName = this.appConfig.get('senderName');
    this.clientUrl = this.appConfig.get('clientUrl');

    const sendGridApiKey = this.appConfig.get('sendGridApiKey');
    if (!sendGridApiKey) {
      this.isSgInitialized = false;
    } else {
      sgMail.setApiKey(sendGridApiKey);
      this.isSgInitialized = true;
    }
  }

  async sendWelcomeEmail(email: string, username?: string) {
    if (!this.isSgInitialized) return;

    const msg = {
      to: email,
      from: { email: this.senderEmail, name: this.senderName },
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
    if (!this.isSgInitialized) return;

    const msg = {
      to: email,
      from: { email: this.senderEmail, name: this.senderName },
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

  async sendManualMsgEmail(
    email: string,
    queryText: string,
    websiteUrl: string,
    knowledgeBaseId,
    sessionId,
  ) {
    if (!this.isSgInitialized) return;

    const msg = {
      to: email,
      from: { email: this.senderEmail, name: this.senderName },
      templateId: 'd-f024c533a3344b5b835f6d9391ff9b52',
      dynamicTemplateData: {
        website_url: websiteUrl,
        msg_msg: queryText,
        kb_id: knowledgeBaseId,
        session_id: sessionId,
      },
    };

    const res = await sgMail.send(msg);
    return res;
  }

  sendToken80ExhaustedEmail = async (email: string) => {
    if (!this.isSgInitialized) return;

    const msg = {
      to: email,
      from: { email: this.senderEmail, name: this.senderName },
      templateId: 'd-8bcb4db974004aa080a4c06e011ddc8a',
    };

    const res = await sgMail.send(msg);
    return res;
  };

  sendToken100ExhaustedEmail = async (email: string) => {
    if (!this.isSgInitialized) return;

    const msg = {
      to: email,
      from: { email: this.senderEmail, name: this.senderName },
      templateId: 'd-7d140563825745a2b4c8e02afab18aea',
    };

    const res = await sgMail.send(msg);
    return res;
  };

  async sendInviteUserEmail(
    email: string,
    ownerEmail: string,
    kbId: string,
    userExist: boolean,
  ) {
    if (!this.isSgInitialized) return;

    const websiteUrl = userExist
      ? `${this.clientUrl}/login`
      : `${this.clientUrl}/sign-up`;

    const acceptUrl = `${this.clientUrl}/knowledgebase/kbId/accept_invite`;

    const msg = {
      to: email,
      from: { email: this.senderEmail, name: this.senderName },
      templateId: 'd-46f484fb64ae432aa8ca732e5ab2c1a9',
      dynamicTemplateData: {
        owner_email: ownerEmail,
        user_name: ownerEmail,
        accept_url: acceptUrl,
        website_url: websiteUrl,
      },
    };

    const res = await sgMail.send(msg);
    return res;
  }
}

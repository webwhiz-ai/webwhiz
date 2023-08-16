import { Body, Controller, Put, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { RequestWithUser } from '../common/@types/nest.types';
import { RegisterWebhookDTO } from './webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Put('/')
  async registerWebhook(
    @Req() req: RequestWithUser,
    @Body() data: RegisterWebhookDTO,
  ) {
    const { user } = req;
    return this.webhookService.registerWebhook(
      user._id,
      data.url,
      data.signingSecret,
    );
  }
}

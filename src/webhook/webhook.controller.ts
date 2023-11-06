import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { RequestWithUser } from '../common/@types/nest.types';
import { RegisterWebhookDTO, WebhookDTO } from './webhook.dto';

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

  @Post('/')
  @HttpCode(201)
  async registerNewWebhook(
    @Req() req: RequestWithUser,
    @Body() data: WebhookDTO,
  ) {
    const { user } = req;
    return this.webhookService.registerNewWebhook(user._id, data);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteWebhook(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    return this.webhookService.deleteWebhookForUser(user._id, id);
  }
}

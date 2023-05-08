import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../auth/guards/public.guard';
import { SubscriptionService } from './subscription.service';

@Controller('lemon')
export class LemonSqueezyController {
  constructor(private subService: SubscriptionService) {}

  @Post('/updates')
  @HttpCode(200)
  @Public()
  async webhookHandler(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
    @Body() data: any,
  ) {
    this.subService.handleLemonSqueezyWebhookEvent(
      data,
      signature,
      req.rawBody,
    );
  }
}

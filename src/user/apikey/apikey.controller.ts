import { Controller, Post, Req, Delete, Get } from '@nestjs/common';
import { RequestWithUser } from '../../common/@types/nest.types';
import { ApikeyService } from './apikey.service';

@Controller('user/apikey')
export class ApikeyController {
  constructor(private readonly apikeyService: ApikeyService) { }

  @Get()
  getAllApiKeys(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.apikeyService.getAllApiKeys(user);
  }

  @Post()
  createApiKey(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.apikeyService.createApiKey(user);
  }

  @Delete()
  deleteApiKey(@Req() req: any): any {
    const { user } = req;
    return this.apikeyService.deleteApiKey(user);
  }
}

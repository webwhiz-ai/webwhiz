import { Controller, Post, Req, Delete, Get } from '@nestjs/common';
import { RequestWithUser } from '../../common/@types/nest.types';
import { ApikeyService } from './apikey.service';

@Controller('user/apikey')
export class ApikeyController {
  constructor(private apikeyService: ApikeyService) { }

  @Get()
  getAllApiKeys(@Req() req: RequestWithUser) {
    return this.apikeyService.getAllApiKeys(req.user);
  }

  @Post()
  createApiKey(@Req() req: RequestWithUser) {
    return this.apikeyService.createApiKey(req.user);
  }

  @Delete()
  deleteApiKey(@Req() req: any): any {
    return this.apikeyService.deleteApiKey(req.user);
  }
}

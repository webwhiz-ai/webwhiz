import { Controller, Post, Req, Delete, Get, HttpCode } from '@nestjs/common';
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

  /**
   * Creates a new API key for the user.
   * @param req The request object containing the user information.
   * @returns The created API key.
   */
  @Post()
  @HttpCode(201)
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

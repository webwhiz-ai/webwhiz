import { Controller, Post, Req, Delete, Get, HttpCode } from '@nestjs/common';
import { RequestWithUser } from '../../common/@types/nest.types';
import { ApikeyData } from '../user.schema';
import { ApikeyService } from './apikey.service';

@Controller('user/apikey')
export class ApikeyController {
  constructor(private readonly apikeyService: ApikeyService) { }

  /**
   * Retrieves all API keys for a given user.
   * @param req The request object containing the user information.
   * @returns A promise that resolves to an array of ApikeyData objects.
   */
  @Get()
  @HttpCode(200)
  async getAllApiKeys(@Req() req: RequestWithUser): Promise<ApikeyData[]> {
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
  async createApiKey(@Req() req: RequestWithUser): Promise<string> {
    const { user } = req;
    return this.apikeyService.createApiKey(user);
  }

  @Delete()
  deleteApiKey(@Req() req: any): any {
    const { user } = req;
    return this.apikeyService.deleteApiKey(user);
  }
}

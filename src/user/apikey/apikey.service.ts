import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ApikeyData, UserSparse } from '../user.schema';
import { UserService } from '../user.service';

@Injectable()
export class ApikeyService {
  constructor(private readonly userService: UserService) { }

  /**
   * Retrieves all API keys for a given user.
   * @param user - The user object.
   * @returns A promise that resolves to an array of ApikeyData objects.
   */
  async getAllApiKeys(user: UserSparse): Promise<ApikeyData[]> {
    const apiKeysData = await this.userService.getUserApikeys(user._id);
    if (!apiKeysData) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!apiKeysData.apiKeys || apiKeysData.apiKeys.length === 0) {
      return [];
    }
    return apiKeysData.apiKeys;
  }

  deleteApiKey(user: UserSparse): any {
    throw new Error('Method not implemented.');
  }

  /**
   * Creates a new API key for a user.
   * @param user - The user for whom the API key is being created.
   * @returns A promise that resolves to the generated API key.
   */
  async createApiKey(user: UserSparse): Promise<string> {
    const apikey = uuidv4();

    const apikeyData: ApikeyData = {
      id: new ObjectId(),
      apiKey: apikey,
    };
    return await this.userService.addNewApikey(user._id, apikeyData);
  }
}

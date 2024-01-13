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

  /**
   * Deletes an API key for a user.
   * @param userId - The ID of the user.
   * @param id - The ID of the API key to delete.
   * @returns A Promise that resolves to the result of the deletion.
   * @throws HttpException if the API key ID is invalid.
   */
  async deleteApiKey(userId: ObjectId, id: string) {
    let apiKeyId: ObjectId;
    try {
      apiKeyId = new ObjectId(id);
    } catch (e) {
      throw new HttpException('Invalid API-Key id', HttpStatus.BAD_REQUEST);
    }
    return await this.userService.deleteApiKey(userId, apiKeyId);
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

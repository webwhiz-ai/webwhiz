import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ApikeyData, UserSparse } from '../user.schema';
import { UserService } from '../user.service';

@Injectable()
export class ApikeyService {
  constructor(private readonly userService: UserService) { }

  getAllApiKeys(user: UserSparse) {
    throw new Error('Method not implemented.');
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

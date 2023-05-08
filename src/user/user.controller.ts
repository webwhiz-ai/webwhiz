import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/@types/nest.types';
import { UserService } from './user.service';

@Controller('user')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/profile')
  async getProfile(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.userService.getUserProfile(user);
  }
}

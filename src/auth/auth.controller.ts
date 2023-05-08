import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from '../user/user.dto';
import { User } from '../user/user.schema';
import { AdminLoginDTO, GoogleAuthDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './guards/public.guard';
import { Roles } from './guards/role.enum';
import { JwtToken } from './types/jwt-types.dto';
import { Role } from './types/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Checks the user credentials and logs in the user
   * @param userDTO
   * @returns user object and jwt token
   */
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request & { user: User }): Promise<JwtToken> {
    return this.authService.getJwtTokenForUser(req.user);
  }

  @Post('/signup')
  @Public()
  async signup(@Body() data: CreateUserDTO) {
    return this.authService.signup(data);
  }

  @Post('/google_auth')
  @Public()
  async googleAuth(@Body() data: GoogleAuthDTO) {
    return this.authService.googleAuth(data);
  }

  @Post('admin_login')
  @Roles(Role.Admin)
  async adminLogin(@Body() data: AdminLoginDTO): Promise<JwtToken> {
    return this.authService.getJwtTokenForUserAdmin(data.id);
  }
}

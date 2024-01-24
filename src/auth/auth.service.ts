import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../common/config/appConfig.service';
import { CreateUserDTO } from '../user/user.dto';
import { UserSparse } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { GoogleAuthDTO } from './auth.dto';
import { getGoogleUserProfile } from './google-auth';
import { JwtPayload, JwtToken } from './types/jwt-types.dto';
import { EmailService } from '../common/email/email.service';
import { KnowledgebaseService } from '../knowledgebase/knowledgebase.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private appConfig: AppConfigService,
    private emailService: EmailService,
    private knowledgebaseService: KnowledgebaseService,
  ) {}

  /**
   * Generates the jet token
   * @param payload
   * @returns the JsonWebToken as string
   */
  private signPayload(payload: JwtPayload) {
    return {
      access: this.jwtService.sign(payload),
    };
  }

  /**
   * Validated the user from the JWT token
   * @param payload
   * @returns user object from the payload
   */
  async validateJwtPayload(payload: JwtPayload) {
    const { sub } = payload;
    return this.userService.findUserByIdSparse(sub);
  }

  /**
   * Generate Jwt token from user (used by login controller)
   * @param user .
   * @returns Signed JwtToken
   */
  async getJwtTokenForUser(user: UserSparse): Promise<JwtToken> {
    await this.userService.updateLastLoginTs(user);

    await this.userService.findUserByIdSparse(user._id.toString());

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return this.signPayload(payload);
  }

  async getJwtTokenForUserAdmin(id: string): Promise<JwtToken> {
    const user = await this.userService.findUserByIdSparse(id);

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return this.signPayload(payload);
  }

  /**
   * Validate user based on username / password
   * @param username .
   * @param password .
   * @returns User ob
   */
  async validateEmailPassword(email: string, password: string) {
    return this.userService.findByEmailPassword(email, password);
  }

  /**
   * Signup a new user
   * @param data
   * @returns
   */
  async signup(data: CreateUserDTO) {
    const user = await this.userService.createUser(data);
    await this.emailService.sendWelcomeEmail(user.email);
    const token = await this.getJwtTokenForUser(user);
    return {
      ...user,
      ...token,
    };
  }

  async googleAuth(data: GoogleAuthDTO) {
    let userProfile;
    try {
      userProfile = await getGoogleUserProfile(
        data.token,
        this.appConfig.get('googleClientId'),
      );
      if (!userProfile.email) {
        throw new HttpException(
          'Invalid Google User profile info',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch {
      throw new HttpException(
        'Invalid Google Access Token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if user is already created
    const user = await this.userService.getUserByEmail(userProfile.email);

    // If user already exists generate jwt token
    if (user) {
      await this.userService.updateLastLoginTs(user);
      return this.getJwtTokenForUser(user);
    }

    // Create user
    const newUser = await this.userService.createGoogleOAuthUser(userProfile);
    await this.emailService.sendWelcomeEmail(newUser.email);
    return this.getJwtTokenForUser(newUser);
  }
}

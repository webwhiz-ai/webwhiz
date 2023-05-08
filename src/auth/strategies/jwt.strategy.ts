import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-types.dto';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../common/config/appConfig.service';

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: AppConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('secretKey'),
    });
  }

  /**
   * Validates the user from the payload
   * @param payload
   * @param done
   * @returns
   */
  async validate(payload: JwtPayload, done: VerifiedCallback) {
    const user = await this.authService.validateJwtPayload(payload);

    if (!user) {
      return done(
        new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED),
        false,
      );
    }

    return done(null, user, null);
  }
}

export { JwtStrategy };

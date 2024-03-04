import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

@Injectable()
export class ApikeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly authService: AuthService) {
    super({ header: 'api-key', prefix: '' }, true, async (apikey, done) => {
      const user = await this.authService.validateApiKey(apikey);
      if (!user) {
        return done(
          new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED),
          false,
        );
      }

      return done(null, user);
    });
  }
}

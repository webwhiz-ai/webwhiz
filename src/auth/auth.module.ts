import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigService } from '../common/config/appConfig.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailModule } from '../common/email/email.module';
import { ApikeyStrategy } from './strategies/apikey.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.get('secretKey'),
        signOptions: { expiresIn: '15d' },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, ApikeyStrategy],
})
export class AuthModule {}

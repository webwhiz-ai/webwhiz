import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './appConfig.service';
import configuration from './configuration';

@Global()
@Module({
  imports: [
    // App configuration
    ConfigModule.forRoot({ load: [configuration] }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
class AppConfigModule {}

export { AppConfigModule };

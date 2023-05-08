import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './configuration';

@Injectable()
class AppConfigService {
  constructor(private configService: ConfigService<AppConfig>) {}

  // Reexport the get function from the config service
  get = this.configService.get.bind(
    this.configService,
  ) as ConfigService<AppConfig>['get'];

  get isProd(): boolean {
    return this.configService.get('nodeEnv', { infer: true }) === 'production';
  }

  get isDev(): boolean {
    return this.configService.get('nodeEnv', { infer: true }) === 'development';
  }

  get isTest(): boolean {
    return this.configService.get('nodeEnv', { infer: true }) === 'test';
  }
}

export { AppConfigService };

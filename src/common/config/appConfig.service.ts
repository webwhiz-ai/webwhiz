import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, FeatureFlags } from './configuration';

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

  /**
   * Retrieves the value of a feature flag.
   *
   * @param name - The name of the feature flag.
   * @returns The value of the feature flag. Returns `false` if the feature flag is not found.
   */
  getFeatureFlag(name: keyof FeatureFlags): boolean {
    return (
      this.configService.get(`featureFlags.${name}`, {
        infer: true,
      }) || false
    );
  }
}

export { AppConfigService };

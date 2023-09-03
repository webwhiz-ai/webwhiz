import { Injectable } from '@nestjs/common';
import { MetricsService } from './common/metrics/metrics.service';

@Injectable()
export class AppService {
  constructor(private metricsService: MetricsService) {}

  getHello(): string {
    this.metricsService.incrementChatbotAnswer();
    return 'Hello World!';
  }
}

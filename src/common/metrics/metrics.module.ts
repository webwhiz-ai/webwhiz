import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      controller: MetricsController,
    }),
  ],
  providers: [
    MetricsService,
    makeCounterProvider({
      name: 'chatbot_answer',
      help: 'Total count of successful chatbot answer',
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}

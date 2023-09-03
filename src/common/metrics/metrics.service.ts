import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('chatbot_answer') private counter: Counter<string>,
  ) {}

  incrementChatbotAnswer() {
    this.counter.inc();
  }
}

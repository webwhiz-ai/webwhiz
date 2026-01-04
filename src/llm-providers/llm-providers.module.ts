import { Module } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { LLMProviderFactory } from './llm-provider.factory';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [OpenaiModule],
  providers: [AnthropicService, LLMProviderFactory],
  exports: [AnthropicService, LLMProviderFactory],
})
export class LLMProvidersModule {}
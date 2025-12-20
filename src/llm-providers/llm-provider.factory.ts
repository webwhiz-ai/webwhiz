import { Injectable, Logger } from '@nestjs/common';
import { ModelProvider } from '../knowledgebase/knowledgebase.schema';
import { OpenaiService } from '../openai/openai.service';
import { AnthropicService } from './anthropic.service';
import { LLMProvider, ModelInfo } from './types';

@Injectable()
export class LLMProviderFactory {
  private readonly logger = new Logger(LLMProviderFactory.name);

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly anthropicService: AnthropicService,
  ) {}

  getProvider(provider: ModelProvider): LLMProvider {
    switch (provider) {
      case ModelProvider.OPENAI:
        return this.openaiService as any; // We'll adapt OpenAI service later
      case ModelProvider.ANTHROPIC:
        return this.anthropicService;
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  getProviderByModel(model: string): LLMProvider {
    // Try to determine provider from model name
    if (this.anthropicService.validateModel(model)) {
      return this.anthropicService;
    }
    
    // Default to OpenAI for existing models
    return this.openaiService as any;
  }

  getAllAvailableModels(): ModelInfo[] {
    const models: ModelInfo[] = [];
    
    // Add OpenAI models
    models.push(
      {
        name: 'gpt-3.5-turbo',
        provider: ModelProvider.OPENAI,
        displayName: 'GPT-3.5 Turbo',
        inputTokenCost: 1,
        outputTokenCost: 1,
        creditMultiplier: 1,
      },
      {
        name: 'gpt-4-0613',
        provider: ModelProvider.OPENAI,
        displayName: 'GPT-4',
        inputTokenCost: 60,
        outputTokenCost: 40,
        creditMultiplier: 20,
      },
      {
        name: 'gpt-4-turbo-preview',
        provider: ModelProvider.OPENAI,
        displayName: 'GPT-4 Turbo',
        inputTokenCost: 20,
        outputTokenCost: 20,
        creditMultiplier: 10,
      },
      {
        name: 'gpt-4o',
        provider: ModelProvider.OPENAI,
        displayName: 'GPT-4o',
        inputTokenCost: 1,
        outputTokenCost: 1,
        creditMultiplier: 1,
      }
    );
    
    // Add Anthropic models
    models.push(...this.anthropicService.getAvailableModels());
    
    return models;
  }

  getModelInfo(model: string): ModelInfo | undefined {
    return this.getAllAvailableModels().find(m => m.name === model);
  }
}
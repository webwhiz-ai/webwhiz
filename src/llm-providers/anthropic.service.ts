import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Subject } from 'rxjs';
import { createHash } from 'node:crypto';
import { AppConfigService } from '../common/config/appConfig.service';
import { ModelProvider } from '../knowledgebase/knowledgebase.schema';
import {
  ChatCompletionRequest,
  ChatResponse,
  ChatMessage,
  LLMProvider,
  ModelInfo,
} from './types';

// Anthropic model configurations
const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    name: 'claude-3-haiku-20240307',
    provider: ModelProvider.ANTHROPIC,
    displayName: 'Claude 3 Haiku',
    inputTokenCost: 0.5, // Relative to base cost
    outputTokenCost: 1.25,
    creditMultiplier: 1,
  },
  {
    name: 'claude-3-sonnet-20240229',
    provider: ModelProvider.ANTHROPIC,
    displayName: 'Claude 3 Sonnet',
    inputTokenCost: 3,
    outputTokenCost: 15,
    creditMultiplier: 5,
  },
  {
    name: 'claude-3-opus-20240229',
    provider: ModelProvider.ANTHROPIC,
    displayName: 'Claude 3 Opus',
    inputTokenCost: 15,
    outputTokenCost: 75,
    creditMultiplier: 20,
  },
];

function getAnthropicClient(keys: string[]): [string, string] {
  const randomKeyIdx = Math.floor(Math.random() * keys.length);
  const selectedKey = keys[randomKeyIdx];
  const selectedKeyHash = createHash('md5').update(selectedKey).digest('hex');
  return [selectedKey, selectedKeyHash];
}

@Injectable()
export class AnthropicService implements LLMProvider {
  readonly provider = ModelProvider.ANTHROPIC;
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiterMemory;
  private readonly defaultKeys: string[] = [];

  constructor(private appConfig: AppConfigService) {
    this.logger = new Logger(AnthropicService.name);

    // Get Anthropic API keys from config
    const anthropicKey = this.appConfig.get('anthropicKey');
    if (anthropicKey) {
      this.defaultKeys.push(anthropicKey);
    }

    // Rate limiter for Anthropic API (adjust based on their limits)
    this.rateLimiter = new RateLimiterMemory({
      points: 100, // requests per minute
      duration: 60,
    });
  }

  getTokenCount(input: string): number {
    // Rough approximation: 1 token ≈ 4 characters for Claude
    // In production, you'd want to use Anthropic's tokenizer
    return Math.ceil(input.length / 4);
  }

  validateModel(model: string): boolean {
    return ANTHROPIC_MODELS.some(m => m.name === model);
  }

  getAvailableModels(): ModelInfo[] {
    return ANTHROPIC_MODELS;
  }

  private convertMessages(messages: ChatMessage[]): any[] {
    // Convert OpenAI format to Anthropic format
    const anthropicMessages: any[] = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        // Anthropic handles system messages differently
        continue;
      }
      
      anthropicMessages.push({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      });
    }
    
    return anthropicMessages;
  }

  private getSystemMessage(messages: ChatMessage[]): string {
    // Extract system message content
    const systemMessage = messages.find(m => m.role === 'system');
    return systemMessage?.content || '';
  }

  async getChatCompletion(
    request: ChatCompletionRequest,
    keys?: string[]
  ): Promise<ChatResponse> {
    keys = keys || this.defaultKeys;
    if (!keys.length) {
      throw new Error('No Anthropic API keys available');
    }

    const [apiKey, keyHash] = getAnthropicClient(keys);

    // Rate limiting
    try {
      await this.rateLimiter.consume(`anthropic-req-${keyHash}`, 1);
    } catch (err) {
      this.logger.error('Anthropic API Request exceeded rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    const anthropicMessages = this.convertMessages(request.messages);
    const systemMessage = this.getSystemMessage(request.messages);

    const anthropicRequest = {
      model: request.model,
      max_tokens: 4000, // Anthropic requires max_tokens
      temperature: request.temperature || 0.1,
      top_p: request.top_p || 1,
      messages: anthropicMessages,
      ...(systemMessage && { system: systemMessage }),
    };

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        anthropicRequest,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      const content = response.data.content[0]?.text || '';
      const usage = response.data.usage || {};

      return {
        response: content,
        tokenUsage: {
          prompt: usage.input_tokens || 0,
          completion: usage.output_tokens || 0,
          total: (usage.input_tokens || 0) + (usage.output_tokens || 0),
        },
      };
    } catch (err) {
      this.logger.error('Anthropic API error', err.response?.data || err.message);
      throw err;
    }
  }

  async getChatCompletionStream(
    request: ChatCompletionRequest,
    completeCb?: (answer: string, usage: ChatResponse['tokenUsage']) => Promise<void>,
    keys?: string[]
  ): Promise<any> {
    keys = keys || this.defaultKeys;
    if (!keys.length) {
      throw new Error('No Anthropic API keys available');
    }

    const [apiKey, keyHash] = getAnthropicClient(keys);

    // Rate limiting
    try {
      await this.rateLimiter.consume(`anthropic-req-${keyHash}`, 1);
    } catch (err) {
      this.logger.error('Anthropic API Request exceeded rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    const observable = new Subject<string>();
    const anthropicMessages = this.convertMessages(request.messages);
    const systemMessage = this.getSystemMessage(request.messages);

    const anthropicRequest = {
      model: request.model,
      max_tokens: 4000,
      temperature: request.temperature || 0,
      top_p: request.top_p || 1,
      messages: anthropicMessages,
      stream: true,
      ...(systemMessage && { system: systemMessage }),
    };

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        anthropicRequest,
        {
          responseType: 'stream',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      const stream = response.data;
      let answer = '';
      let buffer = '';

      stream.on('data', (data) => {
        const dataStr = buffer.length
          ? buffer + data.toString()
          : data.toString();
        
        const lines = dataStr.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') continue;
              
              const parsed = JSON.parse(jsonStr);
              
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text || '';
                if (content) {
                  observable.next(JSON.stringify({ content }));
                  answer += content;
                }
              }
            }
            buffer = '';
          } catch (err) {
            buffer += line;
          }
        }
      });

      stream.on('end', () => {
        observable.next('[DONE]');
        observable.complete();
        
        // Estimate token usage for completion callback
        const promptTokens = this.getTokenCount(
          request.messages.map(m => m.content).join(' ')
        );
        const completionTokens = this.getTokenCount(answer);
        
        completeCb?.(answer, {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        });
      });
    } catch (err) {
      this.logger.error('Anthropic API streaming error', err.response?.data || err.message);
      throw err;
    }

    return observable;
  }
}
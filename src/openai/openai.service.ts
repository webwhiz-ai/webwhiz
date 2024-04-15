import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Subject } from 'rxjs';
import { AppConfigService } from '../common/config/appConfig.service';
import * as tiktoken from '@dqbd/tiktoken';
import { createHash } from 'node:crypto';
import { EmbeddingModel } from '../knowledgebase/knowledgebase.schema';
import {
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
} from 'openai/resources/chat/completions';

const TOKENIZERS = {
  chatgtp: tiktoken.encoding_for_model('gpt-3.5-turbo'),
};

export interface ChatGTPResponse {
  response: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

// export type ChatGptPromptMessages = CreateChatCompletionRequest['messages'];
export type ChatGptPromptMessages = ChatCompletionCreateParams['messages'];

function getOpenAiClient(keys: string[]): [OpenAI, string, string] {
  // Select random key from the given list of keys
  const randomKeyIdx = Math.floor(Math.random() * keys.length);
  const selectedKey = keys[randomKeyIdx];
  const selectedKeyHash = createHash('md5').update(selectedKey).digest('hex');

  const client = new OpenAI({
    apiKey: selectedKey,
  });
  return [client, selectedKey, selectedKeyHash];
}

@Injectable()
export class OpenaiService {
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiterMemory;
  private readonly embedRateLimiter: RateLimiterMemory;
  private readonly defaultKeys = [];

  constructor(private appConfig: AppConfigService) {
    this.defaultKeys = [
      this.appConfig.get('openaiKey'),
      this.appConfig.get('openaiKey2'),
    ];

    this.logger = new Logger(OpenaiService.name);

    // Rate limiter for 100 req / min
    this.embedRateLimiter = new RateLimiterMemory({
      points: 400,
      duration: 60 * 1,
    });

    this.rateLimiter = new RateLimiterMemory({
      points: 600,
      duration: 60 * 1,
    });
  }

  getTokenCount(input: string): number {
    const encoder = TOKENIZERS['chatgtp'];
    const tokens = encoder.encode(input);
    return tokens.length;
  }

  /**
   * Get embedding for given string
   * @param input
   * @returns
   */
  async getEmbedding(
    input: string,
    keys?: string[],
    model: EmbeddingModel = EmbeddingModel.OPENAI_EMBEDDING_2,
  ): Promise<number[] | undefined> {
    // Get openAi client from the given keys
    keys = keys || this.defaultKeys;
    const [openAiClient, _, openAiKeyHash] = getOpenAiClient(keys);

    // Rate limiter check
    try {
      await this.embedRateLimiter.consume(`openai-emd-${openAiKeyHash}`, 1);
    } catch (err) {
      this.logger.error('OpenAI Embedding Request exceeded rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    // API Call
    try {
      const embeddingsResponse = await openAiClient.embeddings.create({
        input,
        model,
      });
      return embeddingsResponse.data[0].embedding;
    } catch (err) {
      this.logger.error('OpenAI Embedding API error', err);
      this.logger.error('Error response', err?.error);
      console.log(err);
      throw err;
    }
  }

  /**
   * Get completions from ChatGTP
   * @param data
   * @returns
   */
  async getChatGptCompletion(
    data: ChatCompletionCreateParamsNonStreaming,
    keys?: string[],
  ): Promise<ChatGTPResponse> {
    // Get openAi client from the given keys
    keys = keys || this.defaultKeys;
    const [openAiClient, _, openAiKeyHash] = getOpenAiClient(keys);

    // Rate limiter check
    try {
      await this.rateLimiter.consume(`openai-req-${openAiKeyHash}`, 1);
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion Request exceeded rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    // API Call
    try {
      const res = await openAiClient.chat.completions.create(data);
      return {
        response: res.choices[0].message.content,
        tokenUsage: {
          prompt: res.usage?.prompt_tokens,
          completion: res.usage?.completion_tokens,
          total: res.usage?.total_tokens,
        },
      };
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion API error', err);
      this.logger.error('Error response', err?.error);
      throw err;
    }
  }

  /**
   * Get streaming response from chatgpt
   * @param data
   * @param completeCb
   * @returns
   */
  async getChatGptCompletionStream(
    data: ChatCompletionCreateParamsStreaming,
    completeCb?: (
      answer: string,
      usage: ChatGTPResponse['tokenUsage'],
    ) => Promise<void>,
    keys?: string[],
  ) {
    keys = keys || this.defaultKeys;
    const [openAiClient, _, openAiKeyHash] = getOpenAiClient(keys);

    try {
      await this.rateLimiter.consume(`openai-req-${openAiKeyHash}`, 1);
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion Request exceeded rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    const observable = new Subject<string>();

    const promptTokens = this.getTokenCount(
      data.messages.map((m) => m.content).join(' '),
    );

    let answer = '';

    (async () => {
      // Wrap the async loop in an IIFE to handle asynchronously
      try {
        const completion = await openAiClient.chat.completions.create(data);

        for await (const chunk of completion) {
          try {
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              observable.next(JSON.stringify({ content }));
              answer += content;
            }
          } catch (chunkError) {
            this.logger.error('Error processing chunk', chunkError);
            // Handle individual chunk errors here, if required
          }
        }

        observable.next('[DONE]');
        observable.complete();

        const completionTokens = this.getTokenCount(answer);
        if (completeCb) {
          await completeCb(answer, {
            prompt: promptTokens,
            completion: completionTokens,
            total: promptTokens + completionTokens,
          });
        }
      } catch (err) {
        this.logger.error('OpenAI ChatCompletion API error', err);
        this.logger.error('Error response', err.error);
        observable.error(err);
        // throw err;
      }
    })();

    return observable;
  }
}

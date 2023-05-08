import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Subject } from 'rxjs';
import { AppConfigService } from '../common/config/appConfig.service';
import * as tiktoken from '@dqbd/tiktoken';

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

export type ChatGptPromptMessages = CreateChatCompletionRequest['messages'];

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAIApi;
  private readonly openai2: OpenAIApi;
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiterMemory;
  private readonly embedRateLimiter: RateLimiterMemory;

  constructor(private appConfig: AppConfigService) {
    const config = new Configuration({
      apiKey: this.appConfig.get('openaiKey'),
    });
    this.openai = new OpenAIApi(config);

    this.openai2 = new OpenAIApi(
      new Configuration({
        apiKey: this.appConfig.get('openaiKey2'),
      }),
    );

    this.logger = new Logger(OpenaiService.name);

    // Rate limiter for 100 req / min
    this.embedRateLimiter = new RateLimiterMemory({
      points: 100,
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
  async getEmbedding(input: string): Promise<number[] | undefined> {
    // Rate limiter check
    try {
      await this.embedRateLimiter.consume('openai-emd', 1);
    } catch (err) {
      this.logger.error('OpenAI Embedding Request exeeced rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    // API Call
    try {
      const res = await this.openai2.createEmbedding({
        input,
        model: 'text-embedding-ada-002',
      });
      return res.data.data?.[0].embedding;
    } catch (err) {
      this.logger.error('OpenAI Embedding API error', err);
      this.logger.error('Error reponse', err?.response?.data);
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
    data: CreateChatCompletionRequest,
  ): Promise<ChatGTPResponse> {
    // Rate limiter check
    try {
      await this.rateLimiter.consume('openai-req', 1);
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion Request exeeced rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    // API Call
    try {
      const res = await this.openai.createChatCompletion(data);
      return {
        response: res.data.choices[0].message.content,
        tokenUsage: {
          prompt: res.data.usage?.prompt_tokens,
          completion: res.data.usage?.completion_tokens,
          total: res.data.usage?.total_tokens,
        },
      };
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion API error', err);
      this.logger.error('Error reponse', err?.response?.data);
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
    data: CreateChatCompletionRequest,
    completeCb?: (
      answer: string,
      usage: ChatGTPResponse['tokenUsage'],
    ) => Promise<void>,
  ) {
    // Rate limiter check
    try {
      await this.rateLimiter.consume('openai-req', 1);
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion Request exeeced rate limiting');
      throw new Error('Requests exceeded maximum rate');
    }

    const observable = new Subject<string>();

    const promptTokens = this.getTokenCount(
      data.messages.map((m) => m.content).join(' '),
    );

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        { ...data, stream: true },
        {
          responseType: 'stream',
          headers: {
            Authorization: `Bearer ${this.appConfig.get('openaiKey')}`,
          },
        },
      );

      const stream = res.data;

      let answer = '';

      stream.on('data', (data) => {
        const responses = data
          .toString()
          .split('\n\n')
          .filter((c) => c.length > 0);

        for (const res of responses) {
          try {
            if (res === 'data: [DONE]') continue;
            const content = JSON.parse(res.replace('data: ', '')).choices[0]
              ?.delta?.content;
            if (content !== undefined) {
              observable.next(JSON.stringify({ content }));
              answer += content;
            }
          } catch {
            console.log('Error', res);
          }
        }
      });

      stream.on('end', () => {
        observable.next('[DONE]');
        observable.complete();
        const completionTokens = this.getTokenCount(answer);
        completeCb?.(answer, {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        });
      });
    } catch (err) {
      this.logger.error('OpenAI ChatCompletion API error', err);
      let errorString = '';
      err.response.data.setEncoding('utf8');
      err.response.data
        .on('data', (utf8Chunk) => {
          errorString += utf8Chunk;
        })
        .on('end', () => {
          this.logger.error('Error response', errorString);
        });
      throw err;
    }

    return observable;
  }
}

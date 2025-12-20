import { Injectable, Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { LLMProviderFactory } from '../../llm-providers/llm-provider.factory';
import { ModelProvider, Chunk, ChatQueryAnswer, CustomKeyData } from '../knowledgebase.schema';
import { ChatMessage, ChatResponse } from '../../llm-providers/types';
import { OpenaiChatbotService } from './openaiChatbotService';

interface ChunkForCompletion extends Chunk {
  content: string;
  score: number;
}


@Injectable()
export class MultiProviderChatbotService {
  private readonly logger = new Logger(MultiProviderChatbotService.name);

  constructor(
    private readonly llmFactory: LLMProviderFactory,
    private readonly openaiChatbotService: OpenaiChatbotService,
  ) {}

  private getCustomKeys(customKeys?: CustomKeyData): string[] | undefined {
    if (!customKeys?.useOwnKey) return undefined;
    return customKeys?.keys;
  }

  /**
   * Convert OpenAI format messages to universal format
   */
  private convertToUniversalMessages(openaiMessages: any[]): ChatMessage[] {
    return openaiMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));
  }

  /**
   * Get AI answer using the appropriate provider based on model
   */
  async getAiAnswer(
    chatbotName: string,
    query: string,
    topChunks: ChunkForCompletion[],
    prevMessages: ChatQueryAnswer[],
    defaultAnswer: string | undefined,
    prompt: string | undefined,
    customKeys: CustomKeyData,
    model: string | undefined,
    modelProvider: ModelProvider | undefined,
    debug = false,
  ): Promise<ChatResponse & { messages?: any }> {
    // Default to OpenAI if no provider specified (backward compatibility)
    const provider = modelProvider || ModelProvider.OPENAI;
    const selectedModel = model || 'gpt-3.5-turbo';

    // For OpenAI models, use existing service for now
    if (provider === ModelProvider.OPENAI) {
      return this.openaiChatbotService.getAiAnswer(
        chatbotName,
        query,
        topChunks,
        prevMessages,
        defaultAnswer,
        prompt,
        customKeys,
        selectedModel,
        debug,
      );
    }

    // For other providers, use the new abstraction
    const llmProvider = this.llmFactory.getProvider(provider);
    
    // Build the prompt using existing logic
    const openaiMessages = this.openaiChatbotService.getChatGptPrompt(
      chatbotName,
      query,
      topChunks,
      prevMessages,
      defaultAnswer,
      prompt,
    );

    // Convert to universal format
    const universalMessages = this.convertToUniversalMessages(openaiMessages);

    // Get API keys (for custom keys, we'd need to adapt this)
    const apiKeys = this.getCustomKeys(customKeys);

    try {
      const response = await llmProvider.getChatCompletion(
        {
          messages: universalMessages,
          temperature: 0.1,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 1,
          model: selectedModel,
        },
        apiKeys,
      );

      return {
        ...response,
        messages: debug ? { messages: universalMessages } : {},
      };
    } catch (error) {
      this.logger.error(`Error getting AI answer from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get AI answer stream using the appropriate provider
   */
  async getAiAnswerStream(
    chatbotName: string,
    query: string,
    topChunks: ChunkForCompletion[],
    prevMessages: ChatQueryAnswer[],
    answerCompleteCb: (
      answer: string,
      usage: ChatResponse['tokenUsage'],
    ) => Promise<void>,
    defaultAnswer: string | undefined,
    prompt: string | undefined,
    model: string | undefined,
    modelProvider: ModelProvider | undefined,
    customKeys?: CustomKeyData,
  ) {
    // Default to OpenAI if no provider specified (backward compatibility)
    const provider = modelProvider || ModelProvider.OPENAI;
    const selectedModel = model || 'gpt-3.5-turbo';

    // For OpenAI models, use existing service for now
    if (provider === ModelProvider.OPENAI) {
      return this.openaiChatbotService.getAiAnswerStream(
        chatbotName,
        query,
        topChunks,
        prevMessages,
        answerCompleteCb,
        defaultAnswer,
        prompt,
        selectedModel,
        customKeys,
      );
    }

    // For other providers, use the new abstraction
    const llmProvider = this.llmFactory.getProvider(provider);
    
    // Build the prompt using existing logic
    const openaiMessages = this.openaiChatbotService.getChatGptPrompt(
      chatbotName,
      query,
      topChunks,
      prevMessages,
      defaultAnswer,
      prompt,
    );

    // Convert to universal format
    const universalMessages = this.convertToUniversalMessages(openaiMessages);

    // Get API keys
    const apiKeys = this.getCustomKeys(customKeys);

    try {
      return await llmProvider.getChatCompletionStream(
        {
          messages: universalMessages,
          temperature: 0,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: true,
          top_p: 1,
          model: selectedModel,
        },
        answerCompleteCb,
        apiKeys,
      );
    } catch (error) {
      this.logger.error(`Error getting AI answer stream from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Calculate tokens based on provider and model
   */
  calculateTotalTokens(
    qTokens: number,
    aTokens: number,
    model: string,
    provider?: ModelProvider,
  ): number {
    const modelInfo = this.llmFactory.getModelInfo(model);
    
    if (modelInfo) {
      // Use the model-specific cost multipliers
      return Math.round(
        qTokens * modelInfo.inputTokenCost + aTokens * modelInfo.outputTokenCost
      );
    }

    // Fallback to existing logic for unknown models
    switch (model) {
      case 'gpt-4-0613':
        return qTokens * 60 + aTokens * 40;
      case 'gpt-4-turbo-preview':
        return qTokens * 20 + aTokens * 20;
      case 'gpt-3.5-turbo':
      case 'gpt-4o':
      default:
        return qTokens + aTokens;
    }
  }

  /**
   * Calculate message count based on provider and model
   */
  calculateMsgCountBasedOnModel(
    messageCount: number,
    model: string,
    provider?: ModelProvider,
  ): number {
    const modelInfo = this.llmFactory.getModelInfo(model);
    
    if (modelInfo) {
      return messageCount * modelInfo.creditMultiplier;
    }

    // Fallback to existing logic
    switch (model) {
      case 'gpt-4-0613':
        return messageCount * 20;
      case 'gpt-4-turbo-preview':
        return messageCount * 10;
      case 'gpt-3.5-turbo':
      case 'gpt-4o':
      default:
        return messageCount;
    }
  }
}
import { ModelProvider } from '../knowledgebase/knowledgebase.schema';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
  model: string;
  stream?: boolean;
}

export interface ModelInfo {
  name: string;
  provider: ModelProvider;
  displayName: string;
  inputTokenCost: number; // Cost multiplier relative to base
  outputTokenCost: number; // Cost multiplier relative to base
  creditMultiplier: number; // Credit consumption multiplier
}

export interface LLMProvider {
  readonly provider: ModelProvider;
  
  // Chat completion methods
  getChatCompletion(
    request: ChatCompletionRequest,
    apiKeys?: string[]
  ): Promise<ChatResponse>;
  
  getChatCompletionStream(
    request: ChatCompletionRequest,
    completeCb?: (answer: string, usage: ChatResponse['tokenUsage']) => Promise<void>,
    apiKeys?: string[]
  ): Promise<any>;
  
  // Utility methods
  getTokenCount(input: string): number;
  validateModel(model: string): boolean;
  getAvailableModels(): ModelInfo[];
}
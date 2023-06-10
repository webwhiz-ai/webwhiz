import { Inject, Injectable, Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import {
  CELERY_CLIENT,
  CeleryClientQueue,
  CeleryClientService,
} from '../../common/celery/celery-client.module';
import { retryWithBackoff } from '../../common/utils';
import {
  ChatGTPResponse,
  ChatGptPromptMessages,
  OpenaiService,
} from '../../openai/openai.service';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import {
  CHUNK_SIZE,
  ChatQueryAnswer,
  Chunk,
  ChunkStatus,
} from '../knowledgebase.schema';
import { PromptService } from '../prompt/prompt.service';
import { DEFAULT_CHATGPT_PROMPT } from './openaiChatbot.constant';

interface CosineSimilarityWorkerResponse {
  chunkId: {
    $oid: string;
  };
  similarity: number;
}

interface ChunkForCompletion extends Chunk {
  content: string;
  score: number;
}

@Injectable()
export class OpenaiChatbotService {
  private readonly logger: Logger;

  constructor(
    private openaiService: OpenaiService,
    private kbDbService: KnowledgebaseDbService,
    private readonly promptService: PromptService,
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
  ) {
    this.logger = new Logger(OpenaiChatbotService.name);
  }

  /** *******************************************
   * EMBEDDINGS SEARCH RELATED
   ******************************************** */

  /**
   * Check if chunk is valid for working as embedding
   * @param chunk
   * @returns
   */
  isValidChunk(chunk: Chunk): boolean {
    const totalChunk = chunk.title + ' ' + chunk.chunk;
    return totalChunk.length < CHUNK_SIZE;
  }

  /**
   * Get embeddings for a new chunk
   * @param chunk
   * @returns
   */
  async getEmbeddingsForChunk(chunk: Chunk) {
    if (!chunk._id) {
      throw new Error('Invalid Chunk! No _id present');
    }

    const text = chunk.title
      ? `Title: ${chunk.title.trim()}; Content: ${chunk.chunk.trim()}`
      : `Content: ${chunk.chunk.trim()}`;

    // Generate embeddings for chunk
    const embeddings = await retryWithBackoff(
      async () => {
        const embeddings = await this.openaiService.getEmbedding(text);
        return embeddings;
      },
      undefined,
      10, // max 10 retries (102 sec)
    );

    return embeddings;
  }

  /**
   * Generate and add embedding for new chunk to KB
   * @param kbId
   * @param chunk
   */
  async addEmbeddingsForChunk(kbId: ObjectId, chunk: Chunk) {
    const embeddings = await this.getEmbeddingsForChunk(chunk);

    // Add embedding for new chunk into embeddings collection
    await this.kbDbService.insertEmbeddingForChunk({
      _id: chunk._id,
      knowledgebaseId: kbId,
      embeddings,
      type: chunk.type,
    });
    await this.kbDbService.updateChunkById(chunk._id, {
      status: ChunkStatus.EMBEDDING_GENERATED,
    });
  }

  async updateEmbeddingsForChunk(kbId: ObjectId, chunk: Chunk) {
    const embeddings = await this.getEmbeddingsForChunk(chunk);

    // Add embedding for new chunk into embeddings collection
    await this.kbDbService.updateEmbeddingForChunk(chunk._id, embeddings);
    await this.kbDbService.updateChunkById(chunk._id, {
      status: ChunkStatus.EMBEDDING_GENERATED,
    });
  }

  /**
   * Get top n chunks in the knowledgedbase for the given query
   * @param kbId
   * @param query
   * @param threshold
   * @returns
   */
  async getTopNChunks(
    kbId: ObjectId,
    query: string,
    threshold = 0.0,
  ): Promise<ChunkForCompletion[]> {
    // Get embeddings for given query
    const queryEmbedding = await this.openaiService.getEmbedding(query);

    const client = this.celeryClient.get(CeleryClientQueue.DEFAULT);
    const task = client.createTask('worker.get_top_n_chunks');

    const topChunks: CosineSimilarityWorkerResponse[] = JSON.parse(
      await task.applyAsync([queryEmbedding, kbId.toString(), 3]).get(),
    );

    const filteredChunks = topChunks.filter(
      (chunk) => chunk.similarity > threshold,
    );

    const chunksScoreMap = filteredChunks.reduce((map, chunk) => {
      map[chunk.chunkId.$oid] = chunk.similarity;
      return map;
    }, {});

    const chunkIds = filteredChunks.map((c) => new ObjectId(c.chunkId.$oid));

    const topChunkData = (
      await this.kbDbService.getChunkByIdBulk(chunkIds)
    ).map((chunk) => ({
      ...chunk,
      content: `${chunk.title}: ${chunk.chunk}`,
      score: chunksScoreMap[chunk._id.toString()],
    }));

    return topChunkData;
  }

  /** *******************************************
   * CHAT GPT ANSWER RELATED
   ******************************************** */

  getTokenCountForChatGptMessages(messages: ChatGptPromptMessages): number {
    return this.openaiService.getTokenCount(
      messages.reduce<string>((str, p) => {
        str += p.content;
        return str;
      }, ''),
    );
  }

  getChatGptPrompt(
    chatbotName: string,
    query: string,
    topChunks: ChunkForCompletion[],
    prevMessages: ChatQueryAnswer[],
    defaultAnswer: string | undefined,
    prompt?: string,
    maxTokenLimit = 4000,
  ): ChatGptPromptMessages {
    // Defaults
    defaultAnswer = defaultAnswer || "I don't know how to answer that";
    prompt = prompt || DEFAULT_CHATGPT_PROMPT;

    // First compile the prompt without ctx and pastMessages to get the number of tokens
    // that the ctx and passMessages can occupy together
    const emptyPrompt = this.promptService.compilePrompt(prompt, {
      chatbotName,
      ctx: '',
      defaultAnswer,
      pastMessages: [],
      query,
    });
    const emptyPromptTokens = this.getTokenCountForChatGptMessages(emptyPrompt);

    /** ********************************************************************
     * NOTE: Size of chunk matters heavily in the following calculation
     * The current CHUNK_SIZE of 1500 is fit for chatgpt prompt size of 4000
     ********************************************************************* */
    // Calculation on how to split the remainingTokens between ctx and pastMessages
    // CONSIDERATIONS:
    // - Bare minimum - 2 ctx blocks and 2 previous msgs (truncated if necessary)
    // - Only the last 2 messages are important, others can be discarded if necessary
    // - We can truncate the chatbot response of the 2nd last msg if required
    // - Try to fit in as many context blocks as possible
    // LOGIC:
    // - First add two chunks to the context
    // - Add 2 of past messages
    // - If token limit not exceeded
    //    - Continue adding chunks to context till token limit is reached
    // - else
    //    - remove n-2th msg

    const remainingTokens = maxTokenLimit - emptyPromptTokens - 300; // 500 for response
    const pastMessagesTokenCount = prevMessages.reduce((count, m) => {
      count += m.aTokens + this.openaiService.getTokenCount(m.q);
      return count;
    }, 0);

    // Function to construct ctx block given a chunk
    const getCtxBlock = (chunk: ChunkForCompletion) =>
      `${chunk.content}${chunk.url ? '; URL: ' + chunk.url : ''}`;

    // Try to Add 2 chunks initially
    let ctx = '';
    let tokenCount = 0;
    for (let i = 0; i < Math.max(2, topChunks.length); i++) {
      const chunk = topChunks[i];
      const ctxSection = getCtxBlock(chunk);
      const tokens = this.openaiService.getTokenCount(ctxSection);
      if (tokenCount + tokens <= remainingTokens) {
        ctx += `${ctxSection}\n\n`;
        tokenCount += tokens;
      } else {
        break;
      }
    }

    // Check if adding the past messages would exceed token limit
    // If yes then take only last message
    if (tokenCount + pastMessagesTokenCount > remainingTokens) {
      const lastMsg = prevMessages[prevMessages.length - 1];
      const lastMsgTokenCount =
        lastMsg.aTokens + this.openaiService.getTokenCount(lastMsg.q);

      // See if its possibl to add only the last msg
      if (tokenCount + lastMsgTokenCount < remainingTokens) {
        prevMessages = prevMessages.slice(-1);
        tokenCount += lastMsgTokenCount;
      } else {
        prevMessages = [];
      }
    } else {
      tokenCount += pastMessagesTokenCount;
    }

    const pastMessages: ChatGptPromptMessages = prevMessages.flatMap((msg) => [
      { role: 'user', content: msg.q },
      { role: 'assistant', content: msg.a },
    ]);

    // Continue adding chunks to the context till token limit is reached
    for (let i = 2; i < topChunks.length; i++) {
      const chunk = topChunks[i];
      const ctxSection = getCtxBlock(chunk);
      const tokens = this.openaiService.getTokenCount(ctxSection);
      if (tokenCount + tokens <= remainingTokens) {
        ctx += `${ctxSection}\n\n`;
        tokenCount += tokens;
      } else {
        break;
      }
    }

    const messages = this.promptService.compilePrompt(prompt, {
      chatbotName,
      ctx,
      defaultAnswer,
      pastMessages,
      query,
    });

    return messages;
  }

  async getAiAnswer(
    chatbotName: string,
    query: string,
    topChunks: ChunkForCompletion[],
    prevMessages: ChatQueryAnswer[],
    defaultAnswer: string | undefined,
    prompt: string | undefined,
    debug = false,
  ) {
    const messages = this.getChatGptPrompt(
      chatbotName,
      query,
      topChunks,
      prevMessages,
      defaultAnswer,
      prompt,
    );

    if (debug) {
      this.logger.log('Prompt Messages', JSON.stringify(messages));
    }

    const answer = await this.openaiService.getChatGptCompletion({
      messages: messages as any,
      temperature: 0.1,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
      model: 'gpt-3.5-turbo',
    });

    return { ...answer, messages: debug ? { messages } : {} };
  }

  async getAiAnswerStream(
    chatbotName: string,
    query: string,
    topChunks: ChunkForCompletion[],
    prevMessages: ChatQueryAnswer[],
    answerCompleteCb: (
      answer: string,
      usage: ChatGTPResponse['tokenUsage'],
    ) => Promise<void>,
    defaultAnswer: string | undefined,
    prompt: string | undefined,
  ) {
    const messages = this.getChatGptPrompt(
      chatbotName,
      query,
      topChunks,
      prevMessages,
      defaultAnswer,
      prompt,
    );

    const answerStream = await this.openaiService.getChatGptCompletionStream(
      {
        messages: messages as any,
        temperature: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        top_p: 1,
        model: 'gpt-3.5-turbo',
      },
      answerCompleteCb,
    );

    return answerStream;
  }
}

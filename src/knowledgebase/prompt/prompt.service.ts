import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { KnowledgebaseDbService } from '../knowledgebase-db.service';
import { PromptDTO } from '../knowledgebase.dto';
import * as Handlebars from 'handlebars';
import { ChatGptPromptMessages } from '../../openai/openai.service';

export interface PromptContext {
  chatbotName: string;
  defaultAnswer: string;
  pastMessages: any[];
  query: string;
  ctx: string;
}

@Injectable()
export class PromptService {
  constructor(private readonly kbDbService: KnowledgebaseDbService) {}

  async addPrompt(data: PromptDTO) {
    return this.kbDbService.insertPrompt({
      _id: new ObjectId(data._id),
      prompt: data.prompt,
    });
  }

  async listPrompts() {
    return this.kbDbService.listPrompts();
  }

  async getPrompt(id: ObjectId) {
    return this.kbDbService.getPrompt(id);
  }

  async updatePrompt(data: PromptDTO) {
    return this.kbDbService.updatePrompt(new ObjectId(data._id), {
      prompt: data.prompt,
    });
  }

  async deletePrompt(id: string) {
    return this.kbDbService.deletePrompt(new ObjectId(id));
  }

  compilePrompt(prompt: string, context: PromptContext): ChatGptPromptMessages {
    try {
      const parsedPrompt = JSON.parse(prompt) as any[];

      // Interpolate variables in content and add pastMessages
      const finalPrompt = parsedPrompt
        .map((p) => ({
          ...p,
          content: p.content
            ? Handlebars.compile(p.content, {
                noEscape: true,
              })(context)
            : undefined,
        }))
        .flatMap((p) => (p.role === 'pastMessages' ? context.pastMessages : p));

      return finalPrompt;
    } catch {
      return null;
    }
  }
}

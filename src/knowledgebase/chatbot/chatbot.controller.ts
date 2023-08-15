import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Sse,
} from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Public } from '../../auth/guards/public.guard';
import { RequestWithUser } from '../../common/@types/nest.types';
import { ChatSessionSparse } from '../knowledgebase.schema';
import {
  ChatbotQueryDTO,
  CreateChatbotSessionDTO,
  PromptTestDTO,
} from './chatbot.dto';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Get('/:id/session')
  async getSessionList(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('page_size') pageSize: number,
    @Query('page') page?: number,
  ) {
    const { user } = req;
    return this.chatbotService.getChatSessionsForKnowledgebase(
      user,
      id,
      pageSize || 10,
      page,
    );
  }

  @Get('/session/:id')
  async getSessionData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ChatSessionSparse> {
    const { user } = req;
    return this.chatbotService.getChatSessionData(user, id);
  }

  @Public()
  @Post('/session')
  @HttpCode(200)
  async createSession(
    @Body() data: CreateChatbotSessionDTO,
    @RealIP() ip: string,
    @Query('src') src?: string,
  ) {
    return this.chatbotService.createChatSession(
      data.knowledgebaseId,
      {
        ip,
        ...data.userData,
      },
      false,
      src,
    );
  }

  @Public()
  @Post('/test_prompt')
  async testPrompt(@Body() data: PromptTestDTO) {
    return this.chatbotService.testPrompt(data);
  }

  @Post('/demo_session')
  @HttpCode(200)
  async createDemoSession(
    @Body() data: CreateChatbotSessionDTO,
    @RealIP() ip: string,
  ) {
    return this.chatbotService.createChatSession(
      data.knowledgebaseId,
      {
        ip,
        ...data.userData,
      },
      true,
    );
  }

  @Public()
  @Post('/answer')
  @HttpCode(200)
  async answer(@Body() data: ChatbotQueryDTO, @Query('debug') debug: boolean) {
    return this.chatbotService.getAnswer(data.sessionId, data.query, debug);
  }

  @Public()
  @Sse('/answer_stream')
  async answerSse(
    @Query('session') sessionId: string,
    @Query('query') query: string,
  ) {
    return this.chatbotService.getAnswerStream(sessionId, query);
  }
}

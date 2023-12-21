import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
  SetChatbotSessionMsgFeedbackDTO,
  UpdateChatbotSessionDTO,
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

  @Delete('/session/:sessionId')
  @HttpCode(200)
  async removeSession(
    @Req() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ) {
    const { user } = req;
    return this.chatbotService.deleteSessionBySession(user, sessionId);
  }

  @Post('/session/:sessionId/read')
  @HttpCode(200)
  async markMessageAsRead(
    @Req() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ) {
    const { user } = req;
    return this.chatbotService.markSessionAsRead(user, sessionId);
  }

  @Post('/session/:sessionId/unread')
  @HttpCode(200)
  async markMessageAsUnread(
    @Req() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ) {
    const { user } = req;
    return this.chatbotService.markSessionAsUnread(user, sessionId);
  }
  @Public()
  @Post('/session/:sessionId/initiate-manual')
  @HttpCode(200)
  async initiateManualSession(@Param('sessionId') sessionId: string) {
    const isManual = true;
    return this.chatbotService.switchChatSession(sessionId, isManual);
  }

  @Public()
  @Post('/session/:sessionId/initiate-bot')
  @HttpCode(200)
  async initiateBotSession(@Param('sessionId') sessionId: string) {
    const isManual = false;
    return this.chatbotService.switchChatSession(sessionId, isManual);
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
  @Put('/session/:id/feedback')
  @HttpCode(200)
  async setSessionMessageFeedback(
    @Param('id') id: string,
    @Body() data: SetChatbotSessionMsgFeedbackDTO,
  ) {
    return this.chatbotService.setSessionMessageFeedback(
      id,
      data.msgIdx,
      data.feedback,
    );
  }

  @Public()
  @Put('/session/:id')
  @HttpCode(200)
  async updateSession(
    @Param('id') id: string,
    @Body() data: UpdateChatbotSessionDTO,
  ) {
    return this.chatbotService.updateChatbotSession(id, data);
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

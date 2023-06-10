import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Public } from '../../auth/guards/public.guard';
import { RequestWithUser } from '../../common/@types/nest.types';
import { NewOfflineMsgDTO } from './offline-msg.dto';
import { OfflineMsgService } from './offline-msg.service';

@Controller('offline_msg')
export class OfflineMessageController {
  constructor(private readonly offlineMsgService: OfflineMsgService) {}

  @Public()
  @Post('/')
  async addOfflineMsg(@Body() data: NewOfflineMsgDTO) {
    return this.offlineMsgService.createOfflineMessage(data);
  }

  @Get('/:kbId')
  async getOfflineMessagesList(
    @Req() req: RequestWithUser,
    @Param('kbId') kbId: string,
    @Query('page_size') pageSize: number,
    @Query('page') page?: number,
  ) {
    const { user } = req;

    if (!kbId || kbId.length === 0) {
      throw new HttpException('Invalid KbId', HttpStatus.BAD_REQUEST);
    }

    return this.offlineMsgService.getOfflineMsgsForKnowledgebase(
      user,
      kbId,
      pageSize || 10,
      page
    );
  }
}

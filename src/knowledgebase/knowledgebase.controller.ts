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
} from '@nestjs/common';
import { Public } from '../auth/guards/public.guard';
import { Roles } from '../auth/guards/role.enum';
import { Role } from '../auth/types/role.enum';
import { RequestWithUser } from '../common/@types/nest.types';
import { DataStoreService } from './datastore.service';
import {
  AddCustomChunkDTO,
  CreateKnowledgebaseDTO,
  KbCustomKeysDTO,
  SetAdminEmailDTO,
  SetKnowledgebaseDefaultAnswerDTO,
  SetPromptDTO,
  UpdateKnowledgebaseWebsiteDataDTO,
} from './knowledgebase.dto';
import { DataStoreType } from './knowledgebase.schema';
import { KnowledgebaseService } from './knowledgebase.service';

@Controller('knowledgebase')
export class KnowledgebaseController {
  constructor(
    private readonly kbService: KnowledgebaseService,
    private readonly dataStoreService: DataStoreService,
  ) {}

  /**
   * Set Custom Keys for Knowledgebase
   */
  @Put('/custom_keys')
  async setUserCustomKeys(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: KbCustomKeysDTO,
  ) {
    const { user } = req;
    return this.kbService.setUserCustomKeys(user, id, {
      useOwnKey: data.useOwnKey,
      keys: data.keys,
    });
  }

  /**
   * Get Knowleldgebase Detail by ID
   */
  @Get('/:id')
  async getKnowledgebaseData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const { user } = req;
    return this.kbService.getKnowledgeBaseDetail(user, id);
  }

  /**
   *  Delete knowledgebase
   */
  @Delete('/:id')
  @HttpCode(204)
  async deleteKnowledgebase(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const { user } = req;
    return this.kbService.deleteKnowledgebaseForUser(user, id);
  }

  /**
   * Get Chat widget data for KB (Public)
   */
  @Public()
  @Get('/:id/chat_widget_data')
  async getChatWidgetData(@Param('id') id: string) {
    return this.kbService.getKnowledgebaseChatWidgetData(id);
  }

  /**
   * Update chat widget data
   */
  @Put('/:id/chat_widget_data')
  async setChatWidgetData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    const { user } = req;
    return this.kbService.setKnowledgebaseChatWidgeData(user, id, data);
  }

  /**
   * Set Admin email for knowledgebase
   */
  @Put('/:id/admin_email')
  async setAdminEmail(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: SetAdminEmailDTO,
  ) {
    const { user } = req;
    return this.kbService.setKnowledgebaseAdminEmail(user, id, data.email);
  }

  /**
   * Update website data for KB
   */
  @Put('/:id/website_data')
  async updateWebsiteData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: UpdateKnowledgebaseWebsiteDataDTO,
  ) {
    const { user } = req;
    return this.kbService.updateKnowledgebaseWebsiteData(user, id, data);
  }

  /**
   * Update website data for KB
   */
  @Put('/:id/default_answer')
  async setDefaultAnswer(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: SetKnowledgebaseDefaultAnswerDTO,
  ) {
    const { user } = req;
    return this.kbService.setKnowledgebaseDefaultAnswer(
      user,
      id,
      data.defaultAnswer,
    );
  }

  /**
   * Update Prompt for knowledge base
   */
  @Put('/:id/prompt')
  async setPromptId(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: SetPromptDTO,
  ) {
    const { user } = req;
    return this.kbService.setKnowledgebasePrompt(user, id, data.prompt);
  }

  /**
   * Set KB as demo
   */
  @Put('/:id/set_demo')
  @Roles(Role.Admin)
  async setKnowledgebaseAsDemo(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const { user } = req;
    return this.kbService.setKnowledgebaseAsDemo(user, id);
  }

  /*********************************************************
   * CUSTOM DATA APIS
   *********************************************************/

  /**
   * Update Custom Data
   */
  @Get('/:id/datastore/:dId')
  async getDataStoreItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('dId') dId: string,
  ) {
    const { user } = req;
    return this.dataStoreService.getDataStoreItemDetail(user, id, dId);
  }
  /**
   * Update Custom Data
   */
  @Put('/:id/datastore/:dId')
  async updateDataStoreItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('dId') dId: string,
    @Body() data: AddCustomChunkDTO,
  ) {
    const { user } = req;
    return this.dataStoreService.updateDataStoreItemForKnowledgebase(
      user,
      id,
      dId,
      data,
    );
  }

  /**
   * Delete custom data from data store
   */
  @Delete('/:id/datastore/:dId')
  async deleteDataStoreItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('dId') dId: string,
  ) {
    const { user } = req;
    return this.dataStoreService.deleteDataStoreItemFromKnowledgebase(
      user,
      id,
      dId,
    );
  }

  /**
   * Add new custom data data store item
   */
  @Post('/:id/datastore/custom_data')
  async addCustomData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: AddCustomChunkDTO,
  ) {
    const { user } = req;
    return this.dataStoreService.addCustomDataToKnowledgebase(user, id, data);
  }

  /**
   * Get custom data data store items
   */
  @Get('/:id/datastore')
  async listCustomData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('page_size') pageSize?: number,
    @Query('page') page?: number,
    @Query('type') type?: DataStoreType,
  ) {
    const { user } = req;
    return this.dataStoreService.listDataStoreItemsInKnowledgebase(
      user,
      id,
      pageSize || 10,
      type,
      page,
    );
  }

  @Post('/:id/generate_embeddings')
  async generateEmbeddings(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const { user } = req;
    return this.kbService.generateEmbeddingsForKnowledgebase(user, id);
  }

  @Get('/')
  async getKnowledgebasesForUser(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.kbService.listKnowledgebasesForUser(user);
  }

  @Post('/')
  async createKnowledgebase(
    @Req() req: RequestWithUser,
    @Body() data: CreateKnowledgebaseDTO,
  ) {
    const { user } = req;

    return this.kbService.createKnowledgebase(user, data);
  }
}

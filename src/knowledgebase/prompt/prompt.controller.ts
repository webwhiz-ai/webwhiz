import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../../auth/guards/role.enum';
import { Role } from '../../auth/types/role.enum';
import { PromptDTO } from '../knowledgebase.dto';
import { PromptService } from './prompt.service';

@Controller('prompt')
export class PromptsController {
  constructor(private readonly promptService: PromptService) {}

  @Get('/')
  @Roles(Role.Admin)
  async getPrompts() {
    return this.promptService.listPrompts();
  }

  @Post('/')
  @Roles(Role.Admin)
  async addPrompt(@Body() data: PromptDTO) {
    return this.promptService.addPrompt(data);
  }

  @Put('/')
  @Roles(Role.Admin)
  async updatePrompt(@Body() data: PromptDTO) {
    return this.promptService.updatePrompt(data);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  async deletePrompt(@Param('id') id: string) {
    return this.promptService.deletePrompt(id);
  }
}

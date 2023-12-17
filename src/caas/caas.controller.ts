import { Body, Controller, Post, Req } from '@nestjs/common';
import { Public } from '../auth/guards/public.guard';
import { RequestWithUser } from '../common/@types/nest.types';
import { CrawlWebsiteDTO } from './caas.dto';
import { CaasService } from './caas.service';

@Controller('caas')
export class CaasControlle {
  constructor(private readonly caasService: CaasService) {}

  @Public()
  @Post('/crawl')
  async crawlWebsite(
    @Req() req: RequestWithUser,
    @Body() data: CrawlWebsiteDTO,
  ) {
    return this.caasService.crawlWebsite(data);
  }
}

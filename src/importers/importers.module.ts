import { Module } from '@nestjs/common';
import { CeleryClientModule } from '../common/celery/celery-client.module';
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module';
import { CrawlerService } from './crawler/crawler.service';
import { ImportersController } from './importers.controller';
import { PdfImporterService } from './pdf/pdf-importer.service';
import { TextractImporterService } from './textract/textract-importer.service';
import { InscriptisImporterService } from './inscriptis/inscriptis-importer.service';

@Module({
  imports: [CeleryClientModule, KnowledgebaseModule],
  controllers: [ImportersController],
  providers: [
    CrawlerService,
    PdfImporterService,
    TextractImporterService,
    InscriptisImporterService,
  ],
  exports: [CrawlerService],
})
export class ImportersModule {}

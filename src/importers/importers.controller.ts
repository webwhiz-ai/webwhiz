import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from '../common/@types/nest.types';
import { AddDocumentDTO } from './importers.dto';
import { PdfImporterService } from './pdf/pdf-importer.service';
import { TextractImporterService } from './textract/textract-importer.service';

@Controller('knowledgebase/importers')
export class ImportersController {
  constructor(
    private readonly pdfImporterService: PdfImporterService,
    private readonly textractService: TextractImporterService,
  ) {}

  @Post('/pdf')
  @UseInterceptors(FileInterceptor('file'))
  async addPdf(
    @Req() req: RequestWithUser,
    @Body() data: AddDocumentDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(pdf)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { user } = req;

    return this.pdfImporterService.addPdfToDataStore(
      user,
      data.knowledgebaseId,
      file,
    );
  }

  @Post('/document')
  @UseInterceptors(FileInterceptor('file'))
  async addDocument(
    @Req() req: RequestWithUser,
    @Body() data: AddDocumentDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /.(pdf|doc[x]?|html|pptx)/ }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { user } = req;

    return this.textractService.addFileToDataStore(
      user,
      data.knowledgebaseId,
      file,
    );
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import {
  CELERY_CLIENT,
  CeleryClientService,
  CeleryClientQueue,
} from '../../common/celery/celery-client.module';
import { KnowledgebaseDbService } from '../../knowledgebase/knowledgebase-db.service';
import { checkUserIsOwnerOfKb } from '../../knowledgebase/knowledgebase-utils';
import { UserSparse } from '../../user/user.schema';
import * as fsPromises from 'node:fs/promises';
import { resolve } from 'node:path';
import { AppConfigService } from '../../common/config/appConfig.service';

@Injectable()
export class PdfImporterService {
  constructor(
    private readonly kbDbService: KnowledgebaseDbService,
    private readonly appConfig: AppConfigService,
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
  ) {}

  private async addPdfToDataStoreTask(knowledgebaeId: string, pdfPath: string) {
    const client = this.celeryClient.get(CeleryClientQueue.DEFAULT);
    const task = client.createTask('worker.extract_pdf_text');

    await task.applyAsync([knowledgebaeId, pdfPath, 20]); // max pages = 20
  }

  async addPdfToDataStore(
    user: UserSparse,
    knowledgebaseId: string,
    file: Express.Multer.File,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserIsOwnerOfKb(user, kb);

    // Save the file
    try {
      await fsPromises.mkdir(this.appConfig.get('docStorageLocation'));
    } catch {}
    const filePath = `${this.appConfig.get('docStorageLocation')}/${
      file.originalname
    }-${Date.now()}`;
    await fsPromises.writeFile(filePath, file.buffer);

    const absPath = resolve(filePath);

    await this.addPdfToDataStoreTask(knowledgebaseId, absPath);
  }
}

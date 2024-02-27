import { Inject, Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { ObjectId } from 'mongodb';
import { resolve } from 'node:path';
import {
  CELERY_CLIENT,
  CeleryClientQueue,
  CeleryClientService,
} from '../../common/celery/celery-client.module';
import { DataStoreService } from '../../knowledgebase/datastore.service';
import { KnowledgebaseDbService } from '../../knowledgebase/knowledgebase-db.service';
import {
  checkUserPermissionForKb,
  UserPermissions,
} from '../../knowledgebase/knowledgebase-utils';
import { UserSparse } from '../../user/user.schema';

const MAX_PDF_PAGES = 50;

@Injectable()
export class PdfImporterService {
  constructor(
    private readonly kbDbService: KnowledgebaseDbService,
    private readonly datastoreService: DataStoreService,
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
  ) {}

  private async addPdfToDataStoreTask(
    knowledgebaeId: string,
    pdfPath: string,
    filename: string,
  ) {
    const client = this.celeryClient.get(CeleryClientQueue.DEFAULT);
    const task = client.createTask('worker.extract_pdf_text');

    // Extract pdf content and add to KbDataStore
    const datastoreId = await task
      .applyAsync([knowledgebaeId, pdfPath, MAX_PDF_PAGES, filename])
      .get();

    const dsItem = await this.kbDbService.getKbDataStoreItemById(
      new ObjectId(datastoreId),
    );

    // Create embeddings for dsItem
    await this.datastoreService.generateChunksAndEmbeddingsForDataStoreItem(
      dsItem,
    );
  }

  async addPdfToDataStore(
    user: UserSparse,
    knowledgebaseId: string,
    file: Express.Multer.File,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserPermissionForKb(user, kb, [UserPermissions.EDIT]);

    const absPath = resolve(file.path);
    await this.addPdfToDataStoreTask(
      knowledgebaseId,
      absPath,
      file.originalname,
    );

    // Delete the file after processing
    await unlink(absPath);
  }
}

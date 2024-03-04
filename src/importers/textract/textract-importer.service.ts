import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ObjectId } from 'mongodb';
import { extname } from 'node:path';
import { AppConfigService } from '../../common/config/appConfig.service';
import { KnowledgebaseDbService } from '../../knowledgebase/knowledgebase-db.service';
import {
  checkUserPermissionForKb,
  UserPermissions,
} from '../../knowledgebase/knowledgebase-utils';
import {
  DataStoreStatus,
  DataStoreType,
} from '../../knowledgebase/knowledgebase.schema';
import { UserSparse } from '../../user/user.schema';

@Injectable()
export class TextractImporterService {
  constructor(
    private readonly kbDbService: KnowledgebaseDbService,
    private readonly appConfig: AppConfigService,
  ) {}

  private isSupportedFileType(ext: string) {
    switch (ext) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'pptx':
      case 'html':
        return true;
      default:
        return false;
    }
  }

  /**
   * Extract content for file content
   * @param fileType kk
   * @param base64Content
   * @returns
   */
  async extractContentForFileContent(fileType: string, base64Content: string) {
    // Make api call to textract server to get content
    const res = await axios.post(this.appConfig.get('textractServiceUrl'), {
      file_type: fileType,
      data: base64Content,
    });

    return res.data.text;
  }

  /**
   * Extract content for file using textract service
   * @param file
   * @returns
   */
  async extractContentForFile(file: Express.Multer.File): Promise<string> {
    const fileType = extname(file.originalname).slice(1);
    if (!this.isSupportedFileType(fileType)) {
      throw new Error('Unsupported File Type');
    }

    const res = await this.extractContentForFileContent(
      fileType,
      file.buffer.toString('base64'),
    );
    return res;
  }

  async addFileToDataStore(
    user: UserSparse,
    knowledgebaseId: string,
    file: Express.Multer.File,
  ) {
    const kbId = new ObjectId(knowledgebaseId);

    const kb = await this.kbDbService.getKnowledgebaseSparseById(kbId);
    checkUserPermissionForKb(user, kb, [UserPermissions.EDIT]);

    // Extract content
    const content = await this.extractContentForFile(file);

    // Insert to kbDataStore
    const ts = new Date();
    const res = await this.kbDbService.insertToKbDataStore({
      knowledgebaseId: kbId,
      content,
      status: DataStoreStatus.CREATED,
      type: DataStoreType.DOCUMENT,
      url: file.originalname,
      createdAt: ts,
      updatedAt: ts,
    });

    return res;
  }
}

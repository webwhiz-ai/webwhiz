import { Inject, Injectable } from '@nestjs/common';
import {
  CELERY_CLIENT,
  CeleryClientQueue,
  CeleryClientService,
} from '../../common/celery/celery-client.module';

@Injectable()
export class InscriptisImporterService {
  constructor(
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
  ) {}

  async getTextForHtml(html: string): Promise<string> {
    const client = this.celeryClient.get(CeleryClientQueue.DEFAULT);
    const task = client.createTask('worker.extract_html_text');
    const text = await task.applyAsync([html]).get();
    return text;
  }
}

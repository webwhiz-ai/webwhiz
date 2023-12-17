import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CrawlerService } from '../importers/crawler/crawler.service';
import { CrawlWebsiteDTO } from './caas.dto';
import { CrawlConfig } from '../importers/crawler/crawlee/crawler.types';
import {
  CELERY_CLIENT,
  CeleryClientService,
  CeleryClientQueue,
} from '../common/celery/celery-client.module';

@Injectable()
export class CaasService {
  constructor(
    private readonly crawlerService: CrawlerService,
    @Inject(CELERY_CLIENT) private celeryClient: CeleryClientService,
  ) {}

  private cleanWebsiteData(data: CrawlWebsiteDTO): CrawlWebsiteDTO {
    function validateUrl(url: string): string {
      if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        throw new HttpException(`Invalid Url ${url}`, HttpStatus.BAD_REQUEST);
      }

      // Remove any trailing slashes
      url = url.replace(/\/+$/, '');

      return url;
    }

    function validatePath(path: string): string {
      // Ensure / in the beginning
      if (path[0] !== '/') {
        path = '/' + path;
      }

      // Remove any slashes at the end
      path = path.replace(/\/+$/, '');

      return path;
    }

    // Ensure website url and urls is well formed
    data.websiteUrl = validateUrl(data.websiteUrl);
    data.urls = data.urls.map(validateUrl);

    data.include = data.include.map(validatePath);
    data.exclude = data.exclude.map(validatePath);

    return data;
  }

  async crawlWebsite(data: CrawlWebsiteDTO) {
    data.maxPages = data.maxPages < 100 ? data.maxPages : 100;

    const cleanedData = this.cleanWebsiteData(data);

    const baseUrl = new URL(cleanedData.websiteUrl).origin;

    const includeUrlsForInit = cleanedData.include.map((u) => `${baseUrl}${u}`);

    const crawlData: CrawlConfig = {
      urls: [
        cleanedData.websiteUrl,
        ...cleanedData.urls,
        ...includeUrlsForInit,
      ],
      include: cleanedData.include.flatMap((u) => [
        `${baseUrl}${u}`,
        `${baseUrl}${u}/**/*`,
      ]),
      exclude: cleanedData.exclude.flatMap((u) => [
        `${baseUrl}${u}`,
        `${baseUrl}${u}/**/*`,
      ]),
      maxPages: cleanedData.maxPages,
    };

    // Exclude other file types
    data.exclude.push(`${baseUrl}/**/*.mp3`);

    const client = this.celeryClient.get(CeleryClientQueue.CRAWLER);
    const task = client.createTask('tasks.caas_crawl');
    await task.applyAsync([crawlData, data.email]);
  }
}

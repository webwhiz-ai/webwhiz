import { Injectable } from '@nestjs/common';
import {
  CrawleeCrawlerType,
  createCrawleeCrawler,
} from './crawlee/crawlee-crawler';
import {
  CrawlConfig,
  CrawlerPageData,
  CrawlerStats,
} from './crawlee/crawler.types';

@Injectable()
export class CrawlerService {
  async crawl(
    data: CrawlConfig,
    cb: (pageData: CrawlerPageData) => Promise<void>,
  ): Promise<CrawlerStats> {
    const crawler = createCrawleeCrawler(CrawleeCrawlerType.CHEERIO);

    crawler.setConfig(data);

    await crawler.crawl(cb);

    return crawler.getStats();
  }
}

import {
  CrawlConfig,
  CrawleeCrawler,
  CrawlerStats,
  CrawlPageDataCb,
} from './crawler.types';
import { PlaywrightCrawler } from 'crawlee';
import { convertCrawleeStats } from './crawlee-crawler';

export class CrawleePlaywrightCrawler implements CrawleeCrawler {
  private crawler?: PlaywrightCrawler;
  private config?: CrawlConfig;
  private stats?: CrawlerStats;

  public setConfig(config: CrawlConfig) {
    this.config = config;
  }

  public getStats(): CrawlerStats | undefined {
    if (!this.crawler) {
      return this.stats;
    }

    return convertCrawleeStats(this.crawler.stats);
  }

  public async crawl(cb: CrawlPageDataCb) {
    // Create crawler
    this.crawler = new PlaywrightCrawler({
      maxConcurrency: 5,
      maxRequestsPerCrawl: this.config?.maxPages,
      requestHandler: async ({ request, page, enqueueLinks, log }) => {
        const url = request.loadedUrl || request.url;
        const title = await page.title();
        const content = await page.content();

        // Call cb with page data
        await cb({
          url,
          title,
          content,
        });

        await enqueueLinks({
          globs: this.config?.include,
          exclude: this.config?.exclude,
        });
      },
    });

    // Run crawler
    await this.crawler.run(this.config?.urls);

    this.stats = convertCrawleeStats(this.crawler.stats);

    // Cleanup
    await this.crawler.teardown();
  }
}

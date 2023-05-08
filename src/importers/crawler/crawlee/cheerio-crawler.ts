import {
  CrawlConfig,
  CrawleeCrawler,
  CrawlerStats,
  CrawlPageDataCb,
} from './crawler.types';
import { CheerioCrawler, Configuration, LogLevel } from 'crawlee';
import { convertCrawleeStats } from './crawlee-crawler';

const config = new Configuration({
  logLevel: LogLevel.WARNING,
  persistStorage: false,
  storageClientOptions: {
    persistStorage: false,
  },
});

Configuration.getGlobalConfig().set('persistStorage', false);
Configuration.getGlobalConfig().set('storageClientOptions', {
  ...Configuration.getGlobalConfig().get('storageClientOptions'),
  persistStorage: false,
});

export class CrawleeCheerioCrawler implements CrawleeCrawler {
  private crawler?: CheerioCrawler;
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
    this.crawler = new CheerioCrawler(
      {
        maxConcurrency: 15,
        maxRequestsPerCrawl: this.config?.maxPages,
        requestHandler: async ({ request, $, enqueueLinks, log }) => {
          const url = request.loadedUrl || request.url;
          const title = await $('title').text();
          const content = await $.html();

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
      },
      config,
    );

    // Run crawler
    await this.crawler.run(this.config?.urls, {});

    this.stats = convertCrawleeStats(this.crawler.stats);

    // Cleanup
    await this.crawler.requestQueue.drop();
    await this.crawler.teardown();
  }
}

import { Statistics } from 'crawlee';
import { CrawleeCheerioCrawler } from './cheerio-crawler';
import { CrawleeCrawler, CrawlerStats } from './crawler.types';
import { CrawleePlaywrightCrawler } from './playwright-crawler';

export enum CrawleeCrawlerType {
  CHEERIO,
  PLAYRIGHT,
}

function createCrawleeCrawler(type: CrawleeCrawlerType): CrawleeCrawler {
  if (type === CrawleeCrawlerType.CHEERIO) {
    return new CrawleeCheerioCrawler();
  } else if (type === CrawleeCrawlerType.PLAYRIGHT) {
    return new CrawleePlaywrightCrawler();
  }

  throw Error('Unsupported Crawler Type');
}

function convertCrawleeStats(stats: Statistics): CrawlerStats {
  const state = stats.toJSON();
  return {
    crawledPages: state.requestsFinished,
    failedPages: state.requestsFailed,
    runTime: state.crawlerRuntimeMillis,
  };
}

export { createCrawleeCrawler, convertCrawleeStats };

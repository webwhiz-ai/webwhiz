interface CrawlConfig {
  urls: string[];
  include: string[];
  exclude: string[];
  maxPages?: number;
}

interface CrawlerStats {
  crawledPages: number;
  failedPages: number;
  runTime: number;
}

interface CrawlerPageData {
  url: string;
  title: string;
  content: string;
}

type CrawlPageDataCb = (data: CrawlerPageData) => Promise<void>;

interface CrawleeCrawler {
  setConfig: (config: CrawlConfig) => void;
  getStats: () => CrawlerStats | undefined;
  crawl: (cb: CrawlPageDataCb) => Promise<void>;
}

export type {
  CrawlConfig,
  CrawlerStats,
  CrawleeCrawler,
  CrawlerPageData,
  CrawlPageDataCb,
};

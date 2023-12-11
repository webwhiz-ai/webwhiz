import { Module } from '@nestjs/common';
import { Command, CommandFactory, CommandRunner, Option } from 'nest-commander';
import { CrawlerService } from './importers/crawler/crawler.service';

interface BasicCommandOptions {
  string?: string;
  boolean?: boolean;
  number?: number;
}

@Command({
  name: 'basic',
  description: 'A parameter parse',
  options: { isDefault: true },
})
export class BasicCommand extends CommandRunner {
  constructor(private readonly crawlerService: CrawlerService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    console.log('Hello');
    console.log(passedParam, options);

    this.crawlerService.crawl(
      {
        urls: ['https://www.paritydeals.com/docs'],
        include: ['https://www.paritydeals.com/docs/**/*'],
        exclude: [],
        maxPages: 10,
      },
      async (pageData) => {
        console.log(pageData);
      },
    );
  }

  @Option({
    flags: '-n, --number [number]',
    description: 'A basic number parser',
  })
  parseNumber(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-s, --string [string]',
    description: 'A string return',
  })
  parseString(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --boolean [boolean]',
    description: 'A boolean parser',
  })
  parseBoolean(val: string): boolean {
    return JSON.parse(val);
  }
}

@Module({
  // imports: [ImportersModule],
  providers: [BasicCommand, CrawlerService],
})
class WebsiteCrawler {}

async function bootstrap() {
  await CommandFactory.run(WebsiteCrawler);
}

bootstrap();

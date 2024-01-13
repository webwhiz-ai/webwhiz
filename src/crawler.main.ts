import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as celery from 'celery-node';
import { ObjectId } from 'mongodb';
import { AppConfigModule } from './common/config/appConfig.module';
import { MongoModule } from './common/mongo/mongo.module';
import {
  CrawlConfig,
  CrawlerPageData,
} from './importers/crawler/crawlee/crawler.types';
import { CrawlerService } from './importers/crawler/crawler.service';
import { getCleanedHtmlContent } from './importers/crawler/readability/readability';
import { ImportersModule } from './importers/importers.module';
import { InscriptisImporterService } from './importers/inscriptis/inscriptis-importer.service';
import { DataStoreService } from './knowledgebase/datastore.service';
import { KnowledgebaseDbService } from './knowledgebase/knowledgebase-db.service';
import { KnowledgebaseModule } from './knowledgebase/knowledgebase.module';
import {
  DataStoreStatus,
  DataStoreType,
  KbDataStore,
  KnowledgebaseStatus,
} from './knowledgebase/knowledgebase.schema';
import { OpenaiModule } from './openai/openai.module';
import { EmailModule } from './common/email/email.module';
import { TaskModule } from './task/task.module';
import { ChatbotService } from './knowledgebase/chatbot/chatbot.service';
import { AppConfigService } from './common/config/appConfig.service';
import { MaxJobQueue } from './common/max-job-queue';

@Module({
  imports: [
    AppConfigModule,
    MongoModule,
    OpenaiModule,
    KnowledgebaseModule,
    ImportersModule,
    EmailModule,
    TaskModule,
  ],
})
class CrawlerAppModule {}

async function processPage(
  pageData: CrawlerPageData,
  knowledgebaseId: ObjectId,
  insertKbDataStoreEntry: (data: KbDataStore) => Promise<KbDataStore>,
  parser: (html: string) => Promise<string>,
  useAlternateParser = false,
) {
  // Get cleaned text content from the html
  let pageContent;
  if (!useAlternateParser) {
    const cleanedContent = getCleanedHtmlContent(pageData.content);
    try {
      pageContent =
        cleanedContent.markdownContent || cleanedContent.textContent;
    } catch (error) {
      pageContent = '';
    }
  } else {
    // TODO: Fall back to normal parser if this fails
    pageContent = await parser(pageData.content);
  }

  // Add page to kbDataStore
  const ts = new Date();
  await insertKbDataStoreEntry({
    knowledgebaseId,
    url: pageData.url,
    title: pageData.title,
    content: pageContent,
    type: DataStoreType.WEBPAGE,
    status: DataStoreStatus.CREATED,
    createdAt: ts,
    updatedAt: ts,
  });
}

async function bootstrap() {
  // Get required services from NestJs
  const app = await NestFactory.createApplicationContext(CrawlerAppModule);
  const appConfigService = app.get(AppConfigService);
  const crawlerService = app.get(CrawlerService);
  const dataStoreService = app.get(DataStoreService);
  const inscriptisService = app.get(InscriptisImporterService);
  const kbDbService = app.get(KnowledgebaseDbService);
  const chatbotService = app.get(ChatbotService);
  const logger = new Logger('CrawlerWorker');

  // Celery Worker Init
  const redisConnectionStr = `redis://${appConfigService.get(
    'redisHost',
  )}:${appConfigService.get('redisPort')}/`;
  const worker = celery.createWorker(
    redisConnectionStr,
    redisConnectionStr,
    'crawler',
  );
  const client = celery.createClient(
    redisConnectionStr,
    redisConnectionStr,
    'crawler',
  );

  const crawlerJobQueue = new MaxJobQueue(1);

  // Hack to decrease the TTL of the result
  (worker.backend as any).set = function (key: string, value: string) {
    return Promise.all([
      this.redis.setex(key, 60, value),
      this.redis.publish(key, value), // publish command for subscribe
    ]);
  };

  /**
   * Worker function
   * @param crawlData
   * @param knowledgebaseId
   * @returns
   */
  async function doCrawl(
    crawlData: CrawlConfig,
    knowledgebaseId: string,
    retryCount: number,
    useAlternateParser = false,
  ) {
    return crawlerJobQueue.addJob(async () => {
      console.log('Crawldata', crawlData, knowledgebaseId, retryCount);
      console.log('Retry count', retryCount);

      const crawlUrls: string[] = [];

      try {
        const crawlStats = await crawlerService.crawl(
          crawlData,
          async (pageData) => {
            crawlUrls.push(pageData.url);

            await processPage(
              pageData,
              new ObjectId(knowledgebaseId),
              async (data: KbDataStore) =>
                kbDbService.insertToKbDataStore(data),
              async (html: string) => inscriptisService.getTextForHtml(html),
              useAlternateParser,
            );
          },
        );

        let status = KnowledgebaseStatus.CRAWLED;
        if (crawlStats.crawledPages === 0) {
          status = KnowledgebaseStatus.CRAWL_ERROR;
        }

        await kbDbService.setKnowledgebaseCrawlData(
          new ObjectId(knowledgebaseId),
          {
            stats: crawlStats,
          },
          status,
        );

        console.log(crawlStats);

        return {
          ...crawlStats,
        };
      } catch (err) {
        logger.error(`Error in crawl for ${knowledgebaseId}`, err);
        await kbDbService.updateKnowledgebaseStatus(
          new ObjectId(knowledgebaseId),
          KnowledgebaseStatus.CRAWL_ERROR,
        );
        // Retry task with linearly increasing timeout
        if (retryCount < 3) {
          setTimeout(async () => {
            await client
              .createTask('tasks.crawl')
              .applyAsync([
                crawlData,
                knowledgebaseId,
                retryCount ? retryCount + 1 : 1,
                useAlternateParser,
              ]);
          }, retryCount * 1000);
        }
      }
    });
  }

  /**
   * Generate embeddings for knowledgebase
   * @param knowledgebaseId
   */
  async function generateEmbeddingsForKnowledgebase(knowledgebaseId: string) {
    const kbId = new ObjectId(knowledgebaseId);

    // Generate chunks for all data store items which are not trained yet
    const dsItemCursor = kbDbService.getKbDataStoreItemsForKnowledgebase(kbId, [
      DataStoreStatus.CREATED,
      DataStoreStatus.CHUNKED,
    ]);

    try {
      for await (const dsItem of dsItemCursor) {
        await dataStoreService.generateChunksAndEmbeddingsForDataStoreItem(
          dsItem,
        );
      }

      // Set the knowledgebase as ready
      await kbDbService.updateKnowledgebaseStatus(
        kbId,
        KnowledgebaseStatus.READY,
      );
    } catch (err) {
      logger.error(
        `Error in create chunks / embedding for ${knowledgebaseId}`,
        err,
      );
      await kbDbService.updateKnowledgebaseStatus(
        kbId,
        KnowledgebaseStatus.EMBEDDING_ERROR,
      );
      return;
    }
  }

  async function notifyTokenLimit(userId: string) {
    const id = new ObjectId(userId);
    await chatbotService.notifyUserOfTokenLimitExhaustion(id);
  }

  worker.register('tasks.crawl', doCrawl);
  worker.register('tasks.gen_embeddings', generateEmbeddingsForKnowledgebase);
  worker.register('tasks.notify_token_limit', notifyTokenLimit);
  worker.start();
}

bootstrap();

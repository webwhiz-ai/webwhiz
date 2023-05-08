import { TestBed } from '@automock/jest';
import { HttpException } from '@nestjs/common';
import { KnowledgebaseService } from './knowledgebase.service';

describe('KnowledgebaseService', () => {
  let kbService: KnowledgebaseService;

  beforeEach(async () => {
    const { unit } = TestBed.create(KnowledgebaseService).compile();
    kbService = unit;
  });

  describe('cleanWebsiteData', () => {
    it('should remove one trailing slash from websiteUrl and urls', async () => {
      let data = kbService.cleanWebsiteData({
        websiteUrl: 'http://hello.com/',
        urls: [],
        include: [],
        exclude: [],
      });
      expect(data.websiteUrl).toBe('http://hello.com');

      data = kbService.cleanWebsiteData({
        websiteUrl: 'http://hello.com///',
        urls: [],
        include: [],
        exclude: [],
      });
      expect(data.websiteUrl).toBe('http://hello.com');

      data = kbService.cleanWebsiteData({
        websiteUrl: 'http://hello.com///',
        urls: ['http://www.this.com/'],
        include: [],
        exclude: [],
      });
      expect(data.urls[0]).toBe('http://www.this.com');
    });

    it('should throw error for invalid websiteUrl and urls', async () => {
      expect(() => {
        kbService.cleanWebsiteData({
          websiteUrl: 'htp://hello.com///',
          urls: [],
          include: [],
          exclude: [],
        });
      }).toThrow(HttpException);

      expect(() => {
        kbService.cleanWebsiteData({
          websiteUrl: 'http://hello.com///',
          urls: ['htts://this.com'],
          include: [],
          exclude: [],
        });
      }).toThrow(HttpException);
    });

    it('should ensure / in the beginning of include and exclude paths', () => {
      const data = kbService.cleanWebsiteData({
        websiteUrl: 'https://test.com',
        urls: [],
        include: ['/path1', 'path2'],
        exclude: ['/path1', 'path2'],
      });

      expect(data.include[0]).toBe('/path1');
      expect(data.include[1]).toBe('/path2');
      expect(data.exclude[0]).toBe('/path1');
      expect(data.exclude[1]).toBe('/path2');
    });

    it('should remove any trailing slases at end of include and exclude paths', () => {
      const data = kbService.cleanWebsiteData({
        websiteUrl: 'https://test.com',
        urls: [],
        include: ['/path1/', 'path2//'],
        exclude: ['/path1/', 'path2/this/'],
      });

      expect(data.include[0]).toBe('/path1');
      expect(data.include[1]).toBe('/path2');
      expect(data.exclude[0]).toBe('/path1');
      expect(data.exclude[1]).toBe('/path2/this');
    });
  });
});

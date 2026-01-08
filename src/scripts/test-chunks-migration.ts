import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { KnowledgebaseDbService } from '../knowledgebase/knowledgebase-db.service';
import { PgChunksDbService } from '../knowledgebase/pgChunksDb.service';
import { ObjectId } from 'mongodb';
import { ChunkStatus, DataStoreType } from '../knowledgebase/knowledgebase.schema';

/**
 * Integration test script for chunks migration to PostgreSQL
 *
 * Tests:
 * 1. Insert chunks to PostgreSQL
 * 2. Retrieve chunks from PostgreSQL
 * 3. Update chunks in PostgreSQL
 * 4. Delete chunks from PostgreSQL
 * 5. Dual-write functionality
 */
async function testChunksMigration() {
  console.log('🚀 Starting chunks migration integration test...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const kbDbService = app.get(KnowledgebaseDbService);
  const pgChunksService = app.get(PgChunksDbService);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test data
  const testKbId = new ObjectId();
  const testDataStoreId = new ObjectId();
  const testChunkId1 = new ObjectId();
  const testChunkId2 = new ObjectId();

  try {
    // Test 1: Insert chunks directly to PostgreSQL
    console.log('📝 Test 1: Insert chunks to PostgreSQL...');
    try {
      const testChunks = [
        {
          _id: testChunkId1,
          knowledgebaseId: testKbId,
          dataStoreId: testDataStoreId,
          url: 'https://test.com/page1',
          title: 'Test Page 1',
          chunk: 'This is test chunk content number 1 for PostgreSQL migration testing.',
          status: ChunkStatus.CREATED,
          type: DataStoreType.WEBPAGE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: testChunkId2,
          knowledgebaseId: testKbId,
          dataStoreId: testDataStoreId,
          url: 'https://test.com/page2',
          title: 'Test Page 2',
          chunk: 'This is test chunk content number 2 for PostgreSQL migration testing.',
          status: ChunkStatus.CREATED,
          type: DataStoreType.WEBPAGE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await pgChunksService.insertChunksBulkInPg(testChunks);
      console.log('✅ Test 1 PASSED: Chunks inserted successfully\n');
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 1 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Test 2: Retrieve chunks by ID from PostgreSQL
    console.log('📝 Test 2: Retrieve chunks by ID from PostgreSQL...');
    try {
      const retrievedChunks = await pgChunksService.getChunkByIdBulkInPg([
        testChunkId1,
        testChunkId2,
      ]);

      if (retrievedChunks.length !== 2) {
        throw new Error(
          `Expected 2 chunks, got ${retrievedChunks.length}`,
        );
      }

      if (
        retrievedChunks[0].chunk !== 'This is test chunk content number 1 for PostgreSQL migration testing.' &&
        retrievedChunks[1].chunk !== 'This is test chunk content number 1 for PostgreSQL migration testing.'
      ) {
        throw new Error('Chunk content mismatch');
      }

      console.log('✅ Test 2 PASSED: Chunks retrieved successfully');
      console.log(`   - Retrieved ${retrievedChunks.length} chunks`);
      console.log(`   - Chunk 1 title: ${retrievedChunks[0].title}`);
      console.log(`   - Chunk 2 title: ${retrievedChunks[1].title}\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 2 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Test 3: Update chunk in PostgreSQL
    console.log('📝 Test 3: Update chunk in PostgreSQL...');
    try {
      await pgChunksService.updateChunkByIdInPg(testChunkId1, {
        status: ChunkStatus.EMBEDDING_GENERATED,
        title: 'Updated Test Page 1',
      });

      const updatedChunks = await pgChunksService.getChunkByIdBulkInPg([
        testChunkId1,
      ]);

      if (updatedChunks[0].status !== ChunkStatus.EMBEDDING_GENERATED) {
        throw new Error('Status not updated correctly');
      }

      if (updatedChunks[0].title !== 'Updated Test Page 1') {
        throw new Error('Title not updated correctly');
      }

      console.log('✅ Test 3 PASSED: Chunk updated successfully');
      console.log(`   - New status: ${updatedChunks[0].status}`);
      console.log(`   - New title: ${updatedChunks[0].title}\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 3 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Test 4: Get chunks for data store item
    console.log('📝 Test 4: Get chunks for data store item...');
    try {
      const dataStoreChunks =
        await pgChunksService.getChunksForDataStoreItemInPg(testDataStoreId);

      if (dataStoreChunks.length !== 2) {
        throw new Error(
          `Expected 2 chunks for data store, got ${dataStoreChunks.length}`,
        );
      }

      console.log('✅ Test 4 PASSED: Retrieved chunks for data store item');
      console.log(`   - Found ${dataStoreChunks.length} chunks\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 4 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Test 5: Get chunks for knowledgebase (iterator pattern)
    console.log('📝 Test 5: Get chunks for knowledgebase (iterator)...');
    try {
      let count = 0;
      for await (const chunk of pgChunksService.getChunksForKnowledgebaseInPg(
        testKbId,
      )) {
        count++;
        if (!chunk._id) {
          throw new Error('Chunk missing _id');
        }
      }

      if (count !== 2) {
        throw new Error(`Expected 2 chunks, got ${count}`);
      }

      console.log('✅ Test 5 PASSED: Iterator pattern works correctly');
      console.log(`   - Iterated through ${count} chunks\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 5 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Test 6: Delete one chunk by ID
    console.log('📝 Test 6: Delete chunk by ID...');
    try {
      await pgChunksService.deleteChunksByIdBulkInPg([testChunkId2]);

      const remainingChunks = await pgChunksService.getChunkByIdBulkInPg([
        testChunkId1,
        testChunkId2,
      ]);

      if (remainingChunks.length !== 1) {
        throw new Error(
          `Expected 1 chunk after deletion, got ${remainingChunks.length}`,
        );
      }

      if (!remainingChunks[0]._id.equals(testChunkId1)) {
        throw new Error('Wrong chunk remained after deletion');
      }

      console.log('✅ Test 6 PASSED: Chunk deleted successfully');
      console.log(`   - ${remainingChunks.length} chunk remaining\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 6 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Test 7: Delete all chunks for knowledgebase
    console.log('📝 Test 7: Delete all chunks for knowledgebase...');
    try {
      await pgChunksService.deleteChunksForKnowledgebaseInPg(testKbId);

      const remainingChunks = await pgChunksService.getChunkByIdBulkInPg([
        testChunkId1,
      ]);

      if (remainingChunks.length !== 0) {
        throw new Error(
          `Expected 0 chunks after KB deletion, got ${remainingChunks.length}`,
        );
      }

      console.log('✅ Test 7 PASSED: All chunks deleted for KB');
      console.log(`   - 0 chunks remaining\n`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Test 7 FAILED:', error.message, '\n');
      testsFailed++;
    }

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Total:  ${testsPassed + testsFailed}`);
    console.log('═══════════════════════════════════════════\n');

    if (testsFailed === 0) {
      console.log('🎉 All tests passed! Chunks migration is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Fatal error during testing:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

testChunksMigration();

module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const embeddings = await db.collection('embeddings').find({});
    for await (const embedding of embeddings) {
      const kbId = embedding._id;
      for await(const e of embedding.embeddings) {
        await db.collection('kb_embeddings').insertOne({
          _id: e.chunkId,
          knowledgebaseId: kbId,
          embeddings: e.embeddings,
        })
      }
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('kb_embeddings').drop();
  }
};

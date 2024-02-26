module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    const knowledgebase = await db.collection('knowledgebase').find({ "owner": { $exists: true } });
    for await (const kb of knowledgebase) {
      await db.collection('knowledgebase').updateOne(
        { "_id": kb._id },
        {
          $set: {
            "participants": [{
              "id": kb.owner,
              "role": "admin" // admin/editor/reader
            }],
            "schemaVersion": 2 // Optional: Set the new schema version
          }
        }
      );
    }
    await db.collection('knowledgebase').createIndex({ "participants.id": 1 });


  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};

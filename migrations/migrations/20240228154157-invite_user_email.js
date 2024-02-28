module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    const knowledgebase = await db.collection('knowledgebase').find({ "owner": { $exists: true } });
    for await (const kb of knowledgebase) {
      const email = await db.collection('users').findOne({ "_id": kb.owner }).email;
      await db.collection('knowledgebase').updateOne(
        { "_id": kb._id },
        {
          $set: {
            "participants": [{
              "id": kb.owner,
              "email": email,
              "role": "admin" // admin/editor/reader
            }],
            "schemaVersion": 3 // Optional: Set the new schema version
          }
        }
      );
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
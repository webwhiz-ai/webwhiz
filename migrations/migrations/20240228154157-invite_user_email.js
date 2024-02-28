module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    const knowledgebase = await db.collection('knowledgebase').find({ "owner": { $exists: true } });
    for await (const kb of knowledgebase) {
      const user = await db.collection('users').findOne({ "_id": kb.owner });
      await db.collection('knowledgebase').updateOne(
        { "_id": kb._id },
        {
          $set: {
            "participants": [{
              "id": kb.owner,
              "email": user.email,
              "role": "admin" // admin/editor/reader
            }],
            "schemaVersion": 4 // Optional: Set the new schema version
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
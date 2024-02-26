module.exports = {
    async up(db, client) {
      // TODO write your migration here.
      // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
      // Example:
      // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
      db.knowledgebase.find({ "owner": { $exists: true } }).forEach(function(doc) {
            db.knowledgebase.updateOne(
                { "_id": doc._id },
                {
                    $set: {
                        "participants": [{
                                "id": doc.owner,
                                "role": "admin" // admin/editor/reader
                            }],
                        "schemaVersion": 2 // Optional: Set the new schema version
                    }
                }
            );
        });
        
        db.knowledgebase.createIndex({ "participants.id": 1 });
    },
  
    async down(db, client) {
      // TODO write the statements to rollback your migration (if possible)
      // Example:
      // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    }
  };
  
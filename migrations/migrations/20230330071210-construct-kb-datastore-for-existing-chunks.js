module.exports = {
  async up(db, client) {
    // Load all existing knowledgebases
    const kbs = await db.collection("knowledgebase").find();

    // For each kb find all chunks
    for await (const kb of kbs) {
      const agg = [
        {
          $match: {
            knowledgebaseId: kb._id,
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $group: {
            _id: {
              knowledgebaseId: "$knowledgebaseId",
              url: "$url",
            },
            knowledgebaseId: {
              $first: "$knowledgebaseId",
            },
            title: {
              $first: "$title",
            },
            type: {
              $first: "$type",
            },
            content: {
              $push: "$chunk",
            },
            chunks: {
              $push: "$_id",
            },
          },
        },
      ];

      // Find chunks for kb grouped by url
      const pages = await db.collection('chunks').aggregate(agg);

      for await (const page of pages) {
        const url = page._id.url;
        const title = page.title;
        const type = page.type;
        const content = page.content.join('');
        const chunks = page.chunks;
        const ts = new Date();

        const dataStoreEntry = {
          knowledgebaseId: kb._id,
          url,
          title,
          content,
          type,
          createdAt: ts,
          updatedAt: ts,
        }

        // Insert page into db
        const res = await db.collection('kbDataStore').insertOne(dataStoreEntry);

        // Add data store id to chunks
        await db.collection('chunks').updateMany({ _id: {$in: chunks} }, {$set: {dataStoreId: res.insertedId}});
      }

    }
  },

  async down(db, client) {
    // Remove dataStoreId from all chunks
    await db.collection('chunks').updateMany({}, {$unset: {dataStoreId: ""}});

    // Drop kbDataStore collection
    await db.collection('kbDataStore').drop();
  },
};

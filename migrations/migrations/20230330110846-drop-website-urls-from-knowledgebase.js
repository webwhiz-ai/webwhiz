module.exports = {
  async up(db, client) {
    await db.collection('knowledgebase').updateMany({}, {$unset: {'crawlData.urls': ""}});
  },

  async down(db, client) {
  }
};

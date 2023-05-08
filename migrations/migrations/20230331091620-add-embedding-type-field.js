module.exports = {
  async up(db, client) {
    await db.collection('kbEmbeddings').updateMany({}, {$set: {type: 'WEBPAGE'}})
  },

  async down(db, client) {
    await db.collection('kbEmbeddings').updateMany({}, {$unset: {type: ""}})
  }
};

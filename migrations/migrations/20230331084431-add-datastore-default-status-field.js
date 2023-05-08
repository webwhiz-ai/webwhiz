module.exports = {
  async up(db, client) {
    await db.collection('kbDataStore').updateMany({}, {$set: {status: 'TRAINED'}})
  },

  async down(db, client) {
    await db.collection('kbDataStore').updateMany({}, {$unset: {status: ""}})
  }
};

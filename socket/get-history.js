const mongoose = require("mongoose");

const { historySchema } = require('../database/history-schema');

const getHistory = async ({ data, socket }) => {
  try{
    const { _id } = data;
    const myHistoryDB = new mongoose.model(`history${_id}`, historySchema, `history${_id}`);
    const history = await myHistoryDB.find();
    socket.emit('set-history', { history });
  } catch(e){ console.log(e); }
}

module.exports = { getHistory };
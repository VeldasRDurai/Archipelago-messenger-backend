const { users } = require('../database/database');
const { historySchema } = require('../database/history-schema');

const getHistory = async ({ data, socket }) => {
    try{
        const user = await users.findOne( {'email' :data.email } );
        socket.emit('set-history', { history: user.history });
      } catch(e){ console.log(e); }
}

module.exports = { getHistory };
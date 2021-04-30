const { users, activeUsers } = require('../database/database');

const newUser = async ({ data, socket }) => {
    try {
      console.log(data);
      const { email } = data;
      await activeUsers({ email , socketId:socket.id }).save(); 
      const user = await users.findOne( {'email' :email } );
      socket.emit('set-history', { history: user.history });
    } catch (e) { console.log(e); }
}

module.exports = { newUser };
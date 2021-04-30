const { activeUsers } = require('../database/database');

const disconnect = async ({ socket }) => {
    try {
        console.log('user disconnected' , socket.id );
        let acknowledge = await activeUsers.deleteOne({ socketId:socket.id }); 
        console.log( acknowledge );
    } catch (e){ console.log(e); }
}

module.exports = { disconnect };
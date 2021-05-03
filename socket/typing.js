const { activeUsers } = require('../database/database');

const typing = async ({ data, socket }) => {
    try{
        const { isTyping, chattingWithEmail, email } = data;

        // ----- **unnecessary** -----
        const ack1 = await activeUsers.updateOne({'email':email},{'isTyping':isTyping});
        console.log('Updated typing status : ' , ack1 );
        // ----- **unnecessary**-----
        
        const partner = await activeUsers.find({ 'email':chattingWithEmail, 'chattingWithEmail':email });
        partner.forEach( item => 
            socket.broadcast.to(item.socketId).emit('toggle-typing', { isTyping }) 
        )
    } catch(e){ console.log(e); }
}

module.exports = { typing };
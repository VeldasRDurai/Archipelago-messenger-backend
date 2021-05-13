const mongoose = require("mongoose");

const { activeUsers } = require('../database/database');
// const { activitySchema } = require('../database/activity-schema');

const typing = async ({ data, socket }) => {
    try{
        const { isTyping, chattingWithEmail, email, _id } = data;

        const ack1 = await activeUsers.updateOne({'email':email},{'isTyping':isTyping});
        console.log('Updated typing status : ' , ack1 );
        
        const partner = await activeUsers.find({ 'email':chattingWithEmail, 'chattingWithEmail':email });
        partner.forEach( item => 
            socket.broadcast.to(item.socketId).emit('toggle-typing', { isTyping }) 
        );

        // updating my activity
        // const myActivityDB = new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
        // await myActivityDB({ 'time': new Date().toGMTString() , 'description': `${ isTyping ? 'started typing ...' : 'stopped typing ... ' }`  }).save();

    } catch(e){ console.log(e); }
}

module.exports = { typing };
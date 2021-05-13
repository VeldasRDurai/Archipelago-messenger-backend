const mongoose = require("mongoose");

const { users, activeUsers } = require('../database/database');
// const { activitySchema } = require('../database/activity-schema');

const disconnect = async ({ socket }) => {
    try {
        const details = await activeUsers.findOne({'socketId':socket.id});
        if ( details ){
            const { email, name, id, chattingWithEmail } = details;
            console.log( email, name, '\nuser disconnected : ' , socket.id );
            const lastSeen = new Date();
    
            // remove the my socket from active user details
            let acknowledge = await activeUsers.deleteOne({ socketId:socket.id }); 
            console.log( acknowledge );
            
            const activeUser = await activeUsers.find({ 'email':email });
            // if no of active users in my name is zero 
            if(!activeUser.length) {
                //updating my user status to offline
                const ack2 = await users.updateOne({'email':email},{ 'online':false,'lastSeen':lastSeen });
                // getting the list of all users chatting currently with me
                const watching = await activeUsers.find({'chattingWithEmail':email});
                watching.forEach( item => {
                    // bradcasting to them that I'm going offline
                    socket.broadcast.to(item.socketId).emit('he-is-offline', { lastSeen });
                });
            }
            
            const partner = await activeUsers.find({ 'email':chattingWithEmail, 'chattingWithEmail':email });
            partner.forEach( item => 
                socket.broadcast.to(item.socketId).emit('toggle-typing', { isTyping:false }) 
            );
    
            // updating my activity
            // const myActivityDB = new mongoose.model(`activity${id}`, activitySchema, `activity${id}`);
            // await myActivityDB({ 'time': new Date().toGMTString() , 'description': `Offline`  }).save();
        }

    } catch (e){ console.log(e); }
}

module.exports = { disconnect };
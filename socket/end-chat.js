const mongoose = require("mongoose");

const { activeUsers } = require('../database/database');
const { activitySchema } = require('../database/activity-schema');

const endChat = async ({ data, socket }) => {
    try {
        const { _id, chattingWithEmail } = data;
        const ack1 = await activeUsers.updateOne({'socketId':socket.id},
            { 'isChatting':false, 'chattingWithEmail':undefined, 'chattingWithName':undefined, 'chattingWithId':undefined });
        
        // updating my activity
        const myActivityDB = new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
        await myActivityDB({ 'time': new Date().toGMTString() , 'description': `Stoped chatting with ${chattingWithEmail}`  }).save();
    } catch (e){ console.log(e); }
}

module.exports = { endChat };
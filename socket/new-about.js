const mongoose = require("mongoose");

const { users, activeUsers } = require('../database/database');
const { historySchema } = require('../database/history-schema');

const newAbout = async ({ data, socket }) => {
    try {
        const { email, name, _id, newAbout } = data ;
        const myHistoryDB = new mongoose.model(`history${_id}`, historySchema, `history${_id}`);

        // updating my about in users details
        const ack1 = await users.updateOne({ 'email':email },{ 'about':newAbout });

        // updating to all active users in my name with new about
        const activeUser = await activeUsers.find({ 'email':email });
        activeUser.forEach( item => {
            socket.broadcast.to(item.socketId).emit('updated-about', { newAbout });
        });

        
        // finding all users in my history
        const historyUsers = await myHistoryDB.find();
        historyUsers.forEach( async (item) => {
            const sortedId = [ _id, item.id ].sort();
            
            // updating my about in his history
            const hisHistoryDB = new mongoose.model(`history${item.id}`, historySchema, `history${item.id}`);
            await hisHistoryDB.updateOne({'email':email}, { about: newAbout });
            
            // senting his updated history to him if he is a active user
            const history = await hisHistoryDB.find();      
            const activeUser = await activeUsers.find({ 'email':item.email });
            activeUser.forEach( item2 => {
                socket.broadcast.to(item2.socketId).emit('set-history', { history });
            });
        });
        
        // --** unnecessary
        // updating to all active users who is chatting with me 
        // const activeUser = await activeUsers.find({ 'chattingWithEmail':email });
        // activeUser.forEach( item => {
        //     socket.broadcast.to(item.socketId).emit('updated-chattingWithEmail', { newAbout });
        // });
        
    } catch (e){ console.log(e); }
}

module.exports = { newAbout };
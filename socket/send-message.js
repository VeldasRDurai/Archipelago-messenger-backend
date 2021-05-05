const mongoose = require("mongoose");

const { users, activeUsers } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');
const { historySchema } = require('../database/history-schema');

const sendMessage = async ({ data, socket }) => {
    try {
        console.log('send message');
        // console.log(data);
        const { email, name, _id, chattingWithEmail, chattingWithName, chattingWithId, message } = data;
        const currentTime = new Date();

        // adding new message to database with read and delivered none
        const sortedId = [ _id, chattingWithId ].sort();
        // console.log( 'sorted id in senting : ', sortedId );
        const chatDB = new mongoose.model( `chats${sortedId[0]}chats${sortedId[1]}`, chatSchema,`chats${sortedId[0]}chats${sortedId[1]}` );
        const ack1 = await chatDB({ 'sendBy':email , 'message':message , 'messageTime':currentTime }).save();
        
        
        const myHistoryDB = new mongoose.model(`history${_id}`, historySchema, `history${_id}`);
        const hisHistoryDB = new mongoose.model(`history${chattingWithId}`, historySchema, `history${chattingWithId}`);
        const myHistory = await myHistoryDB.findOne({'email':chattingWithEmail});
        
        // adding new message to database with read and delivered none
        if(!myHistory){ 
            // cheaking weather I have a history of him ; 
            // There is no need for checking weather he has a history of mine ; since both are created concurrently
            const hisDetails = await users.findOne({ 'email':chattingWithEmail });
            const ack3 = await myHistoryDB({ 'email':chattingWithEmail, 'name':chattingWithName, 'id':chattingWithId,
                'picture':hisDetails.picture, 'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime }).save();
            const myDetails = await users.findOne({ 'email':email });
            const ack4 = await hisHistoryDB({ 'email':email, 'name':name, 'id':_id,
                'picture':myDetails.picture, 'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime, 'unRead':1 }).save();
        } else {
            const ack5 = await myHistoryDB.updateOne({'email':chattingWithEmail},
                {'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime, 'lastDelivered':false, 'lastReaded':false });
            const { unRead } = await hisHistoryDB.findOne({'email':email});
            const ack6 = await hisHistoryDB.updateOne({'email':email},
                {'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime, 'lastDelivered':false, 'lastReaded':false, 'unRead': Number(unRead) + 1 });
        }
        
        const activeUser = await activeUsers.find({ 'email':chattingWithEmail });
        // console.log('activeUsers : ', activeUser);
        if(activeUser.length) { // when no of active users in his name is not 0 
            // he is online
            if(activeUser.some( item => item.isChatting && item.chattingWithEmail === email )){
                const ack7 = await chatDB.updateMany({'sendBy':email, 'delivered':false}, // he is chatting with me
                    {'delivered':true,'readed':true});
                const ack8 = await myHistoryDB.updateOne({'email':chattingWithEmail},{'lastDelivered':true, 'lastReaded':true});
                const ack9 = await hisHistoryDB.updateOne({'email':email},{'lastDelivered':true, 'lastReaded':true, 'unRead':0 });
            } else {
                const ack10 = await chatDB.updateMany({'sendBy':email, 'delivered':false}, // he not chatting with me
                    {'delivered':true});
                const ack8 = await myHistoryDB.updateOne({'email':chattingWithEmail},{'lastDelivered':true});
                const ack9 = await hisHistoryDB.updateOne({'email':email},{'lastDelivered':true });                
            }
            const oldChat = await chatDB.find();       // our chat with updated status 
            const history = await hisHistoryDB.find(); // his changed history   
            activeUser.forEach( async (item) => {
                if (item.isChatting && item.chattingWithEmail === email){ 
                    // finding weather he is chatting with me
                    // console.log(item.chattingWithEmail === email);
                    socket.broadcast.to(item.socketId).emit('previous-message', { oldChat });
                } else {
                    //finding weather he is online
                    // console.log(item.chattingWithEmail === email);
                    socket.broadcast.to(item.socketId).emit('set-history', { history });
                } 
            });
        }
        
        const oldChat = await chatDB.find();       // our chat with updated status 
        socket.emit('previous-message',{ oldChat });        
    } catch (e) {
        console.log(e);
      }
}

module.exports = { sendMessage };
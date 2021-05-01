const mongoose = require("mongoose");

const { users, activeUsers } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');

const sendMessage = async ({ data, socket }) => {
    try {
        console.log('send message');
        console.log(data);
        const { email, name, _id, chattingWithEmail, chattingWithName, chattingWithId, message } = data;
        const currentTime = new Date();
        const sortedId = [ _id, chattingWithId ].sort();
        
        const chatDB = await new mongoose.model( `${sortedId[0]}chats${sortedId[1]}`, chatSchema,`${sortedId[0]}chats${sortedId[1]}` );
        const ack1 = await chatDB({ 'sendBy':email , 'message':message , 'messageTime':currentTime }).save();
        
        
        const oldChat = await chatDB.find();       // our chat with new message 
        socket.emit('previous-message',{ oldChat });
        
        const myHistoryDB = await new mongoose.model(`history${_id}`, historySchema, `history${_id}`);
        const hisHistoryDB = await new mongoose.model(`history${chattingWithId}`, historySchema, `history${chattingWithId}`);
        const myHistory = await myHistoryDB.findOne({'email':chattingWithEmail});
        
        // cheaking weather I have a history of him ; 
        // There is no need for checking weather he has a history of mine ; since both are created concurrently
        if(!myHistory){ 
            const ack3 = await myHistoryDB({ 
                'email':chattingWithEmail, 
                'name':chattingWithName, 
                'id':chattingWithId,
                'lastSendBy':email,
                'lastMessage':message,
                'lastMessageTime':currentTime,
            }).save();
            const ack4 = await hisHistoryDB({
                'email':email, 
                'name':name, 
                'id':id,
                'lastSendBy':email,
                'lastMessage':message,
                'lastMessageTime':currentTime,
            }).save();
        } else {
            const ack5 = await myHistoryDB.updateOne({'email':chattingWithEmail},{
                'lastSendBy':email,
                'lastMessage':message,
                'lastMessageTime':currentTime,
                'lastDelivered':false,
                'lastReaded':false,
            });
            const hisCurrentUnRead = await hisHistoryDB.findOne({'email':email}).unRead;
            const ack6 = await hisHistoryDB.updateOne({'email':email},{
                'lastSendBy':email,
                'lastMessage':message,
                'lastMessageTime':currentTime,
                'lastDelivered':false,
                'lastReaded':false,
                'unRead': hisCurrentUnRead + 1
            })
        }
        
        const history = await hisHistoryDB.find(); // his changed history   
        
        const activeUser = await activeUsers.find({ 'email':chattingWithEmail });
        activeUser.forEach( async (item) => {
            if (item.isChatting && item.chattingWithEmail === email){ 
                // finding weather he is chatting with me
                const ack7 = await chatDB.updateMany({'sendBy':email, 'delivered':false}, {'delivered':true,'readed':true});
                socket.broadcast.to(item.socketId).emit('previous-message', { oldChat });
            } else {
                //finding weather he is online
                const ack8 = await chatDB.updateMany({'sendBy':email, 'delivered':false}, {'delivered':true});
                socket.broadcast.to(item.socketId).emit('set-history', { history });
            } 
        });

        const oldChat = await chatDB.find();       // our chat with updated status 
        socket.emit('previous-message',{ oldChat });
        
    } catch (e) {
        console.log(e);
      }
}

module.exports = { sendMessage };
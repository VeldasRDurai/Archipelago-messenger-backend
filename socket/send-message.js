const mongoose = require("mongoose");
// const push = require('web-push');

const { users, activeUsers } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');
const { historySchema } = require('../database/history-schema');
const { activitySchema } = require('../database/activity-schema');

const { pushNotification } = require('./push-notification');

// const vapidkeys = {
//     publicKey:'BPTusE7P8UdeFusBo-HAkYSKag0S5cNa1xjGfwmho0mlmSx_ZFj0aoHGKouP0ONYWxAK8cfeYhe5wsQucSPbO9U',
//     privateKey:'DZjYA5kn9BCp27MgcpQpS18jBd2P7nWeFPq_4wMWY4g'
// };

// push.setVapidDetails('mailto:veldasrdurai72@gmail.com', vapidkeys.publicKey, vapidkeys.privateKey );

const sendMessage = async ({ data, socket }) => {
    try {
        console.log('send message');
        // console.log(data);
        const { email, name, _id, picture, chattingWithEmail, chattingWithName, chattingWithId, message } = data;
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
                'picture':hisDetails.picture, 'about':hisDetails.about,
                'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime }).save();
            const myDetails = await users.findOne({ 'email':email });
            const ack4 = await hisHistoryDB({ 'email':email, 'name':name, 'id':_id,
                'picture':myDetails.picture, 'about':myDetails.about, 
                'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime, 'unRead':1 }).save();
        } else {
            const ack5 = await myHistoryDB.updateOne({'email':chattingWithEmail},
                {'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime, 'lastDelivered':false, 'lastReaded':false });
            const hisHistory = await hisHistoryDB.findOne({'email':email});
            const ack6 = await hisHistoryDB.updateOne({'email':email},
                {'lastSendBy':email, 'lastMessage':message, 'lastMessageTime':currentTime, 'lastDelivered':false, 'lastReaded':false, 'unRead': Number(hisHistory.unRead) + 1 });
        }
        
        const activeUser = await activeUsers.find({ 'email':chattingWithEmail });
        // console.log('activeUsers : ', activeUser);
        if(activeUser.length) { // when no of active users in his name is not 0 
            // he is online
            if(activeUser.some( item => item.isChatting && item.chattingWithEmail === email )){
                const ack7 = await chatDB.updateMany({'sendBy':email, 'delivered':false}, // he is chatting with me
                    {'delivered':true, 'deliveredTime':currentTime, 'readed':true, 'readedTime':currentTime });
                const ack8 = await myHistoryDB.updateOne({'email':chattingWithEmail},{'lastDelivered':true, 'lastReaded':true});
                const ack9 = await hisHistoryDB.updateOne({'email':email},{'lastDelivered':true, 'lastReaded':true, 'unRead':0 });
            } else {
                const ack10 = await chatDB.updateMany({'sendBy':email, 'delivered':false}, // he not chatting with me
                    {'delivered':true, 'deliveredTime':currentTime });
                const ack8 = await myHistoryDB.updateOne({'email':chattingWithEmail},{'lastDelivered':true});
                const ack9 = await hisHistoryDB.updateOne({'email':email},{'lastDelivered':true });                
            }
            const oldChat = await chatDB.find().sort({ _id: -1 }).limit(1000);       // our chat with updated status 
            const history = await hisHistoryDB.find(); // his changed history   
            activeUser.forEach( async (item) => {
                if (item.isChatting && item.chattingWithEmail === email){ 
                    // finding weather he is chatting with me
                    socket.broadcast.to(item.socketId).emit('previous-message', { oldChat });
                } else {
                    //finding weather he is online
                    socket.broadcast.to(item.socketId).emit('set-history', { history });
                    // socket.broadcast.to(item.socketId).emit('push-notification', { notifyEmail:email, notifyName:name, notifyMessage:message });
                    // const subscriper = await activeUsers.find({ 'socketId': item.socketId });
                    // if( subscriper.subscription ){
                    //     console.log('server send notification')
                    //     push.sendNotification(subscription,'test message');
                    // }
                } 
            });
        }
        
        pushNotification({ email, name, picture, message, chattingWithEmail });

        const oldChat = await chatDB.find().sort({ _id: -1 }).limit(1000);       // our chat with updated status 
        socket.emit('previous-message',{ oldChat });        

        // updating my activity
        const myActivityDB = new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
        await myActivityDB({ 'time': new Date().toGMTString() , 'description': `Sended a message to ${chattingWithEmail}`  }).save();

    } catch (e) {
        console.log(e);
      }
}

module.exports = { sendMessage };
const mongoose = require("mongoose");

const { activeUsers } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');
const { historySchema } = require('../database/history-schema');
const { watchingSchema } = require('../database/watching-schema');
// const { activitySchema } = require('../database/activity-schema');

const startChat = async ({ data, socket }) => {
  try {
    const { email, name, _id, chattingWithEmail, chattingWithName, chattingWithId } = data;
    const sortedId = [ _id, chattingWithId ].sort();

    // changed all his messages as read which is not readed yet
    const chatDB = await new mongoose.model( `${sortedId[0]}chats${sortedId[1]}`, chatSchema,`${sortedId[0]}chats${sortedId[1]}` );
    let ack1 = await chatDB.updateMany( {'sendBy':chattingWithEmail ,'read':false} , {'read':true} );
    console.log( '1' , ack1 );

    // changed my history unread no to 0 ( iff the last message was sent by him )
    const myHistoryDB = await new mongoose.model(`history${_id}`, historySchema, `history${_id}`);
    const ack2 = await myHistoryDB.updateOne({'email':chattingWithEmail, 'lastSendBy':chattingWithEmail}, 
      {'unRead':0 });

    // changed his history lastReaded to true ( iff the last message was sent by me )
    const hisHistoryDB = await new mongoose.model(`history${chattingWithId}`, historySchema, `history${chattingWithId}`);
    const ack3 = await hisHistoryDB.updateOne({'email':email, 'lastSendBy':chattingWithEmail},
      {'lastReaded': true });

    const oldChat = await chatDB.find();       // our changed chat
    const history = await hisHistoryDB.find(); // his changed history   
    socket.emit('previous-message',{ oldChat });
    const activeUser = await activeUsers.find({ 'email':chattingWithEmail });
    activeUser.forEach( item => {
      if (item.isChatting && item.chattingWithEmail === email){ 
        // finding weather he is chatting with me
        socket.broadcast.to(item.socketId).emit('previous-message', { oldChat });
      } else {
        //finding weather he is online
        socket.broadcast.to(item.socketId).emit('set-history', { history });
      }
    });
    
    // changing my active user details
    const ack4 = await activeUser.updateOne( {'email':email } , {
      'isChatting': true,
      'chattingWithEmail' : chattingWithEmail,
      'chattingWithName' : chattingWithName,
      'chattingWithId' : chattingWithId
    });

    // changing his wathching schema details
    const watchingDB = await new mongoose.model(`watching${_id}`, watchingSchema, `watching${_id}`);
    const ack5 = await watchingDB({ email: chattingWithEmail, name: chattingWithName, id:chattingWithId }).save();

    // updating my activity
    // const myActivityDB = await new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
    // await myActivityDB({ 'time': new Date(), 'activity': `Started staring at ${chattingWithName}`  }).save();
    
  } catch(e){
    console.log(e);
  }
}

module.exports = { startChat };
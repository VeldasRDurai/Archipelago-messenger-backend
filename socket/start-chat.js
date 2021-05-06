const mongoose = require("mongoose");

const { users, activeUsers } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');
const { historySchema } = require('../database/history-schema');
const { activitySchema } = require('../database/activity-schema');

const startChat = async ({ data, socket }) => {
  try {
    const currentTime = new Date();
    const { email, name, _id, chattingWithEmail, chattingWithName, chattingWithId } = data;
    const sortedId = [ _id, chattingWithId ].sort();
    // console.log( 'sorted id in start chat : ', sortedId );

    // changed all his messages as read which is not readed yet
    const chatDB = new mongoose.model( `chats${sortedId[0]}chats${sortedId[1]}`, chatSchema,`chats${sortedId[0]}chats${sortedId[1]}` );
    let ack0 = await chatDB.find( {'sendBy':chattingWithEmail ,'readed':false});
    console.log('not readed msgs', ack0);
    let ack1 = await chatDB.updateMany( {'sendBy':chattingWithEmail ,'readed':false} , {'readed':true,'readedTime':currentTime} );
    console.log( 'changed all his messages as read' , ack1 );

    // changed my history unread no to 0 ( iff the last message was sent by him )
    const myHistoryDB = new mongoose.model(`history${_id}`, historySchema, `history${_id}`);
    const ack2 = await myHistoryDB.updateOne({'email':chattingWithEmail, 'lastSendBy':chattingWithEmail}, 
      {'unRead':0 });
    console.log('changed my history unread no to 0', ack2 );

    // changed his history lastReaded to true ( iff the last message was sent by me )
    const hisHistoryDB = new mongoose.model(`history${chattingWithId}`, historySchema, `history${chattingWithId}`);
    const ack3 = await hisHistoryDB.updateOne({'email':email, 'lastSendBy':chattingWithEmail},
      {'lastReaded': true });
    console.log('changed his history lastReaded to true', ack3);

    const oldChat = await chatDB.find();       // our changed chat
    const history = await hisHistoryDB.find(); // his changed history   
    socket.emit('previous-message',{ oldChat });
    const activeUser = await activeUsers.find({ 'email':chattingWithEmail });
    console.log('active users : ', activeUser );
    if(activeUser.length) { // when no of active users in his name is not 0 
      socket.emit('he-is-online');
    } else {
      const details = await users.findOne({'email':chattingWithEmail});
      const { lastSeen } = details;
      socket.emit('he-is-offline', { lastSeen });
    }
    activeUser.forEach( item => {
      if (item.isChatting && item.chattingWithEmail === email){ 
        // finding weather he is chatting with me
        socket.broadcast.to(item.socketId).emit('previous-message', { oldChat });
        if ( item.isTyping ){
          socket.emit('toggle-typing', { isTyping:true });
        }
      } else {
        //finding weather he is online
        socket.broadcast.to(item.socketId).emit('set-history', { history });
      }
    });
    
    // changing my active user details
    const ack4 = await activeUsers.updateOne( {'email':email } , {
      'isChatting': true,
      'chattingWithEmail' : chattingWithEmail,
      'chattingWithName' : chattingWithName,
      'chattingWithId' : chattingWithId
    });
    console.log('changing my active user details', ack4 );

    // updating my activity
    const myActivityDB = new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
    await myActivityDB({ 'time': new Date().toGMTString() , 'description': `Started chatting with ${chattingWithEmail}`  }).save();
    
  } catch(e){
    console.log(e);
  }
}

module.exports = { startChat };
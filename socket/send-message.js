const mongoose = require("mongoose");

const { users, activeUsers } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');

const sendMessage = async ({ data, socket }) => {
    try {
        console.log('send message');
        console.log(data);
        const names = [ data.email , data.with ].sort();
        const chatDB = await new mongoose.model( names[0] + names[1] , chatSchema , names[0] + names[1] );
        const info = { sendBy:data.email , msg:data.message , msgTime:new Date() };
        await chatDB( info ).save();
    
        const sender = await users.findOne({ email : data.email });
        if (!(sender.history.some( item => item.email === data.with ) )) {
            console.log("reached2...");
            let ack3 = await users.updateOne( { 'email' : data.email } , 
                { $push : {  history : { 'email':data.with  , 'lastMsg':info.msg , 'lastMsgTime':info.msgTime , 'lastSendBy':data.email } } } );
            console.log( '3' , ack3);
            let ack4 = await users.updateOne( { 'email' : data.with } , 
                { $push : {  history : { 'email':data.email  , 'lastMsg':info.msg , 'lastMsgTime':info.msgTime , 'lastSendBy': data.with , unRead : 1  } } } );
            console.log( '4' , ack4);
        } else {
          let ack5 = await users.updateOne( {'email': data.email , 'history.email':data.with } , 
                { $set : { 'history.$.lastMsg':info.msg , 'history.$.lastMsgTime':info.msgTime , 'history.$.lastSendBy':data.email  } } );
          console.log( '5' , ack5 );
          const user = await users.findOne( {'email':data.with  , 'history.email':data.email } );
          const prevUnRead = user.history.find( item => item.email === data.email ).unRead;
          let ack6 = await users.updateOne( {'email':data.with  , 'history.email':data.email } , 
              { $set : { 'history.$.lastMsg':info.msg , 'history.$.lastMsgTime':info.msgTime , 'history.$.lastSendBy':data.email , 'history.$.unRead':prevUnRead + 1 } } );
          console.log( '6' , ack6 );
        }

        const activeUsersList = await activeUsers.find({ email : data.with });
        console.log( 'activeUsersList' , activeUsersList );
        activeUsersList.forEach( item  => {
            socket.broadcast.to(item.socketId).emit("reciveMsg",{ ...info });
        });
      } catch (e) {
        console.log(e);
      }
}

module.exports = { sendMessage };
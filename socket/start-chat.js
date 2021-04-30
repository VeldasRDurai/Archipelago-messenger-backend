const mongoose = require("mongoose");

const { users } = require('../database/database');
const { chatSchema } = require('../database/chat-schema');

const startChat = async ({ data, socket }) => {
    try{
        console.log("create room");
        console.log( socket.rooms );
        let names = [ data.email , data.with ].sort();
        if(![...socket.rooms].includes(names[0] + names[1])) {
          let ack0 = socket.join( names[0] + names[1] ) ;
          console.log('0' , ack0);
        }
        const chatDB = await new mongoose.model( names[0] + names[1] , chatSchema , names[0] + names[1] );
        let ack1 = await chatDB.updateMany( {'sendBy':data.with ,'read':false} , {'read':true} );
        console.log( '1' , ack1 );
        let ack2 = await users.updateOne({'email': data.email , 'history.email':data.with } , 
            { $set : { 'history.$.unRead': 0 }} );
        console.log( '2' , ack2 );
        const oldChat = await chatDB.find();
        socket.emit('previousMsg' , { oldChat:oldChat } );
  
        console.log( socket.rooms );
      } catch(e){
        console.log(e);
      }
}

module.exports = { startChat };
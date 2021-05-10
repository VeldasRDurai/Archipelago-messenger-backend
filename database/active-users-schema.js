const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activeUsersSchema = new mongoose.Schema({
    email : { type : String ,  required: [ true , " No email specified...!"  ] },
    name : { type : String ,  required: [ true , " No name specified...!"  ] },
    id : { type : String ,  required: [ true , " No id specified...!"  ] },
    socketId : { type : String, required: [ true , " No socket id specified...!"  ] },
    subscription : { type : Schema.Types.Mixed }, 
    isChatting : { type : Boolean, default:false },
    chattingWithEmail : { type : String },
    chattingWithName : { type : String },
    chattingWithId : { type : String },
    isTyping : { type : Boolean, default:false }
});

module.exports = { activeUsersSchema };
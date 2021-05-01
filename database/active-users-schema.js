const mongoose = require("mongoose");

const activeUsersSchema = new mongoose.Schema({
    email : { type : String ,  required: [ true , " No email specified...!"  ] },
    name : { type : String ,  required: [ true , " No name specified...!"  ] },
    socketId : { type : String },
    isChatting : { type : Boolean, default:false },
    chattingWithEmail : { type : String },
    chattingWithName : { type : String },
    chattingWithId : { type : String }
});

module.exports = { activeUsersSchema };
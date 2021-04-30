const mongoose = require("mongoose");

const activeUsersSchema = new mongoose.Schema({
    email: { type : String ,  required: [ true , " No name specified...!"  ] },
    socketId : { type : String },
    isChatting : { type : Boolean, default:false },
    ChattingWith : { type : String }
});

module.exports = { activeUsersSchema };
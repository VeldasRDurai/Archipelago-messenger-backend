const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    email: { type : String ,  required: [ true , " No name specified...!"  ] },
    lastSendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
    lastMsg : { type : String ,  required: [ true , " No msg specified...!"   ] },
    lastMsgTime : { type : Date ,required: [ true , " No date specified...!"  ] },
    unRead  : { type : Number , default:0 }
});

module.exports = { historySchema };
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    email: { type : String ,  required: [ true , " No email specified...!"  ] },
    name : { type : String ,  required: [ true , " No name specified...!"  ] },
    id : { type : String ,  required: [ true , " No id specified...!"  ] },
    picture : { type : String },
    about : { type : String },
    lastSendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
    lastMessage : { type : String ,  required: [ true , " No msg specified...!"   ] },
    lastMessageTime : { type : Date ,required: [ true , " No date specified...!"  ] },
    lastDelivered : { type : Boolean , default: false  },
    lastReaded : { type : Boolean , default: false },
    unRead  : { type : Number , default:0 }
});

module.exports = { historySchema };
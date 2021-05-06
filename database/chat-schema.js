const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
    message : { type : String ,  required: [ true , " No msg specified...!"  ] } ,
    messageTime : { type : Date   ,  required: [ true , " No Date specified...!"  ] } ,
    delivered : { type : Boolean , default: false  },
    deliveredTime : { type : Date },
    readed : { type : Boolean , default: false },
    readedTime : { type : Date }
});

module.exports = { chatSchema };
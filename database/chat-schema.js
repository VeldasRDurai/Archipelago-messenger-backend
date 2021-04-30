const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
    msg    : { type : String ,  required: [ true , " No msg specified...!"  ] } ,
    msgTime: { type : Date   ,  required: [ true , " No Date specified...!"  ] } ,
    read   : { type : Boolean , default: false },
});

module.exports = { chatSchema };
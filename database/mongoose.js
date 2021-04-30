const mongoose = require("mongoose");

mongoose.connect( "mongodb://localhost:27017/" + "pesalama" , 
    { useNewUrlParser:true , useUnifiedTopology: true} );

const historySchema = new mongoose.Schema({
    email: { type : String ,  required: [ true , " No name specified...!"  ] },
    lastSendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
    lastMsg : { type : String ,  required: [ true , " No msg specified...!"   ] },
    lastMsgTime : { type : Date ,required: [ true , " No date specified...!"  ] },
    unRead  : { type : Number , default:0 }
});
const accountSchema = new mongoose.Schema ({
    email : { type : String , required: [ true , " No email specified...!"     ] },
    name  : { type : String , required: [ true , " No name specified...!"     ] },
    password : { type : String },
    refreshToken : { type : String } ,
    history  : { type : [historySchema] } 
});

const chatSchema = new mongoose.Schema({
    sendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
    msg    : { type : String ,  required: [ true , " No msg specified...!"  ] } ,
    msgTime: { type : Date   ,  required: [ true , " No Date specified...!"  ] } ,
    read   : { type : Boolean , default: false },
});

const activeUser = new mongoose.Schema({
    email: { type : String ,  required: [ true , " No name specified...!"  ] },
    socketId : { type : String },
    isChatting : { type : Boolean, default:false },
    ChattingWith : { type : String }
});

const users   = mongoose.model( 'Users' , accountSchema );
const activeUsers = mongoose.model( 'ActiveUsers' , activeUser );

module.exports = { users, activeUsers, chatSchema }
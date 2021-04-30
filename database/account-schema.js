const mongoose = require("mongoose");
const { historySchema } = require('./history-schema');

const accountSchema = new mongoose.Schema ({
    email : { type : String , required: [ true , " No email specified...!"     ] },
    name  : { type : String , required: [ true , " No name specified...!"     ] },
    password : { type : String },
    refreshToken : { type : String } ,
    history  : { type : [historySchema] } 
});

module.exports = { accountSchema };
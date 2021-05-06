const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema ({
    email : { type : String , required: [ true , " No email specified...!"     ] },
    name  : { type : String , required: [ true , " No name specified...!"     ] },
    picture : { type : String },
    about : { type : String , default: "Hey there I'm using archipelago" },
    given_name : { type : String },
    family_name: { type : String },
    online : { type : Boolean },
    lastSeen : { type : Date },
});

module.exports = { accountSchema };
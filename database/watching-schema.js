const mongoose = require("mongoose");

const watchingSchema = new mongoose.Schema({
    email : { type : String ,  required: [ true , " No email specified...!"  ] },
    name : { type : String ,  required: [ true , " No name specified...!"  ] },
    id : { type : String ,  required: [ true , " No id specified...!"  ] },
    socketId : { type : String ,  required: [ true , " No socket id specified...!"  ] }
});

module.exports = { watchingSchema };
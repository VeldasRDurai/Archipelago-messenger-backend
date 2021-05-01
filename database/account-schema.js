const mongoose = require("mongoose");
// const { historySchema }  = require('./history-schema');
// const { activitySchema } = require('./activity-schema');
// const { watchingSchema } = require('./watching-schema');

const accountSchema = new mongoose.Schema ({
    email : { type : String , required: [ true , " No email specified...!"     ] },
    name  : { type : String , required: [ true , " No name specified...!"     ] },
    password : { type : String },
    refreshToken : { type : String },
    online : { type : Boolean },
    lastSeen : { type : Date },
    // history : { type : [historySchema] },
    // activity : { type : [activitySchema] },
    // watching : { type : [watchingSchema] }
});

module.exports = { accountSchema };
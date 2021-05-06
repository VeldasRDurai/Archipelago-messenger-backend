const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    time : { type : String },
    description : { type: String }
});

module.exports = { activitySchema };
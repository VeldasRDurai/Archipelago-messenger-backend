const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    time : { type: Date },
    description : { type: String }
});

module.exports = { activitySchema };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionsSchema = new Schema({
    email : String,
    endpoint: String,
    keys: Schema.Types.Mixed,
    createDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = { subscriptionsSchema };
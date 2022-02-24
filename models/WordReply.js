const mongoose = require('mongoose');

const WordReplySchema = new mongoose.Schema({
    _id: Number,
    word: String,
    reply: String,
    added_by_username: String,
    added_by_id: String
}, {
    versionKey: false
});

module.exports = mongoose.model('WordReply', WordReplySchema);
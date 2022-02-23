const mongoose = require('mongoose');

const WordReplySchema = new mongoose.Schema({
    _id: Number,
    word: String,
    reply: String
}, {
    versionKey: false
});

module.exports = mongoose.model('WordReply', WordReplySchema);
const mongoose = require('mongoose');

const TokensSchema = new mongoose.Schema({
    _id: Number,
    token: String,
    service: String,
    until: Date
}, {
    versionKey: false
});

module.exports = mongoose.model('Tokens', TokensSchema);
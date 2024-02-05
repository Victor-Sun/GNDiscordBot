const mongoose = require('mongoose');

const WowBlacklistSchema = new mongoose.Schema({
    _id: Number,
    ign: String,
    realm: String,
    added_by_username: String,
    added_by_id: String,
    reason: String
}, {
    versionKey: false
});

module.exports = mongoose.model('WowBlacklist', WowBlacklistSchema);
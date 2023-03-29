const mongoose = require('mongoose');

const DiscordDefaultChannelSchema = new mongoose.Schema({
    _id: Number,
    channelId: String,
    discordId: String
}, {
    versionKey: false
});

module.exports = mongoose.model('DiscordDefaultChannel', DiscordDefaultChannelSchema);
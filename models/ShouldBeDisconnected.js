const mongoose = require('mongoose');

const ShouldBeDisconnectedSchema = new mongoose.Schema({
    _id: Number,
    userId: Number,
    guildId: Number,
    until: Date
}, {
    versionKey: false
});

module.exports = mongoose.model('ShouldBeDisconnected', ShouldBeDisconnectedSchema);
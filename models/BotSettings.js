const mongoose = require('mongoose');

const BotSettingsSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    value: Boolean
});

module.exports = mongoose.model('BotSettings', BotSettingsSchema);
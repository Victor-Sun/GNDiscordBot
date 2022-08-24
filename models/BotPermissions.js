const mongoose = require('mongoose');

const BotPermissionsSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    userId: Number,
    value: Boolean
}, {
    versionKey: false
});

module.exports = mongoose.model('BotPermissions', BotPermissionsSchema);
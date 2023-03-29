const mongoose = require('mongoose');

const IgnoreDisconnectSchema = new mongoose.Schema({
    _id: Number,
    userId: Number
}, {
    versionKey: false
});

module.exports = mongoose.model('IgnoreDisconnect', IgnoreDisconnectSchema);
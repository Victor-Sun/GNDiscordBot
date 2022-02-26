const mongoose = require('mongoose')
const config = require('../config');

class Database {
    constructor() {
        this.connection = null
    }

    connect() {
        console.log('Connecting to database...')
        mongoose.connect(`mongodb://${config.MONGO_URL}`, {
            user: config.MONGO_USER,
            pass: config.MONGO_PASS,
            dbName: config.MONGO_DB,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log('Connected to database.');
            this.connection = mongoose.connection;
        }).catch(err => {
            console.error(err);
        })
    }
}

module.exports = Database;
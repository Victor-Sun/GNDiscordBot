const dotenv = require('dotenv')

dotenv.config()

const config = {
    ENV: process.env.ENV,
    TOKEN: process.env.TOKEN,
    CLIENTID: process.env.CLIENTID,
    GUILDID: process.env.GUILDID,
    MONGO_URL:process.env.MONGO_URL,
    MONGO_USER:process.env.MONGO_USER,
    MONGO_PASS:process.env.MONGO_PASS,
    MONGO_DB:process.env.MONGO_DB
}

module.exports = config
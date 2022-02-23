const dotenv = require('dotenv')

dotenv.config()

const config = {
    ENV: process.env.ENV,
    TOKEN: process.env.TOKEN,
    CLIENTID: process.env.CLIENTID,
    GUILDID: process.env.GUILDID,
    MONGO_URL:process.env.MONGO_URL,
}

module.exports = config
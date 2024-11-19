const dotenv = require('dotenv')

dotenv.config()

const config = {
    NODE_ENV: process.env.NODE_ENV,
    TOKEN: process.env.TOKEN,
    CLIENTID: process.env.CLIENTID,
    GUILDID: process.env.GUILDID,
    MONGO_URL:process.env.MONGO_URL,
    MONGO_USER:process.env.MONGO_USER,
    MONGO_PASS:process.env.MONGO_PASS,
    MONGO_DB:process.env.MONGO_DB,
    BLIZZARD_TOKEN:process.env.BLIZZARD_TOKEN,
    PUTIO_CLIENT_ID:process.env.PUTIO_CLIENT_ID,
    PUTIO_CLIENT_SECRET:process.env.PUTIO_CLIENT_SECRET,
    PUTIO_CLIENT_OAUTH:process.env.PUTIO_CLIENT_OAUTH,
    PUTIO_USERNAME:process.env.PUTIO_USERNAME,
    PUTIO_PASSWORD:process.env.PUTIO_PASSWORD,
}

module.exports = config
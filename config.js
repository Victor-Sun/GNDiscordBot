const dotenv = require('dotenv')

dotenv.config()

const config = {
    TOKEN: process.env.TOKEN,
    CLIENTID: process.env.CLIENTID,
    GUILDID: process.env.GUILDID
}

module.exports = config
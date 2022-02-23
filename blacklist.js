const dotenv = require('dotenv')

dotenv.config()

/**
 * This will be used to detect words in messages and delete those messages
 * Use a db later so words can be added
 */
 const blacklist = [
    'nigger',
    'faggot'
]

module.exports = blacklist
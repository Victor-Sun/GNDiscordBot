const blacklist = require('../blacklist.js')

module.exports = {
	name: 'messageCreate',
    on: true,
	async execute(message) {
        let hasBlackListedWord = false

        blacklist.forEach(bl => {
            if (message.content.includes(bl)) {
                hasBlackListedWord = true
            }
        })

        if (hasBlackListedWord) {
            message.channel.send({content: 'yepsums', tts: true })
        }
    },
};
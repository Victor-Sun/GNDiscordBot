const blacklist = require('../blacklist.js')
const BotSettings = require('../models/BotSettings')
const WordList = require('../models/WordReply')

module.exports = {
	name: 'messageCreate',
    on: true,
	async execute(message) {
        let hasBlackListedWord = false
        const ttsSetting = await BotSettings.findOne({ name: 'ttsEnabled'});
        const replyList = await WordList.find();

        if (ttsSetting.value) {
            const replies = [];
    
            replyList.map(reply => {
                if (message.content.includes(reply.word)) {
                    hasBlackListedWord = true;
                    replies.push(reply.reply);
                }
            })

            if (hasBlackListedWord && !message.author.bot) {
                message.delete();
                message.channel.send({content: replies.join(' '), tts: true });
            }
        }
    }
};
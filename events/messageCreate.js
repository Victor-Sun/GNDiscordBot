const BotSettings = require('../models/BotSettings')
const WordList = require('../models/WordReply')

module.exports = {
	name: 'messageCreate',
    on: true,
	async execute(message) {
        let hasBlackListedWord = false
        const ttsSetting = await BotSettings.findOne({ name: 'ttsEnabled'});
        if (!ttsSetting) {
            await BotSettings.insertMany({name: 'ttsEnabled', value: true})
        }
        const replyList = await WordList.find();

        if (ttsSetting && ttsSetting.value) {
            const replies = [];
    
            replyList.map(reply => {
                if (message.content.toLowerCase().includes(reply.word.toLowerCase())) {
                    hasBlackListedWord = true;
                    replies.push(reply.reply);
                }
            })

            if (hasBlackListedWord && !message.author.bot) {
                message.channel.send({content: replies.join(' '), tts: true });
            }
        }
    }
};
const {  SlashCommandBuilder } = require('@discordjs/builders')
const WordReply = require('../models/WordReply')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editbotreply')
		.setDescription('Change the reply that the bot has for a specific word')
        .addStringOption(option => option
            .setName('word')
            .setDescription('Word that the bot will respond to')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reply')
            .setDescription('Reply that bot will use when the word is used in any channel')
            .setRequired(true)
        ),
	async execute(interaction) {
        const word = interaction.options.getString('word');
        const reply = interaction.options.getString('reply');
        const wordCheck = await WordReply.findOne({ word: word });

        if (!wordCheck) {
            interaction.reply('Word does not exist on the db');
        } else {
            const updateWord = await WordReply.updateOne({ word: word }, { reply: reply });
            interaction.reply('Reply editted on the db');
        }
	}
}
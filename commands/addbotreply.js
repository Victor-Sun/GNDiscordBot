const {  SlashCommandBuilder } = require('@discordjs/builders')
const WordReply = require('../models/WordReply')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addbotreply')
		.setDescription('Add word and reply for bot')
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

        if (wordCheck) {
            interaction.reply('Word already exists in the db');
        } else {
            const addWord = await WordReply.insertMany({word: word, reply: reply});
            interaction.reply('Word and reply added to db');
        }
	}
}
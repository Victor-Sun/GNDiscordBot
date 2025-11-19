const {  SlashCommandBuilder } = require('@discordjs/builders')
const WordReply = require('../models/WordReply')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deletebotreply')
		.setDescription('Removes word and reply for bot')
        .addStringOption(option => option
            .setName('word')
            .setDescription('Word that should be deleted off the db')
            .setRequired(true)
        ),
	async execute(interaction) {
        const word = interaction.options.getString('word');
        const wordCheck = await WordReply.findOne({ word: word });

        if (!wordCheck) {
            interaction.reply('Word does not exist on the db.');
        } else {
            await WordReply.deleteOne({ word: word });
            interaction.reply('Word and reply added to db');
        }
	}
}
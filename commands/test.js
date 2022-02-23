const {  SlashCommandBuilder } = require('@discordjs/builders');
const BotSettings = require('../models/BotSettings');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Test command for w/e!'),
	async execute(interaction) {
		interaction.reply('Test command ran')
        interaction.deleteReply()
	}
};
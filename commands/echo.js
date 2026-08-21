const {  SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echos your input!')
        .addStringOption(option => option.setName('message')
        .setDescription('The message to echo')
        .setRequired(true)),
	async execute(interaction) {
		interaction.reply({
            content: interaction.options.getString('message')
        })
	}
}
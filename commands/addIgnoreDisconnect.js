const {  SlashCommandBuilder } = require('@discordjs/builders')
const IgnoreDisconnect = require('../models/IgnoreDisconnect')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aid')
		.setDescription('Adds user to not be disconnected')
        .addUserOption(option => option
            .setName('user')
            .setDescription('@ of the user to add')
            .setRequired(true)
        ),
	async execute(interaction) {
    const user = interaction.options.getUser('user')
    const doesUserExistInTable = await IgnoreDisconnect.findOne({userId: user.id})

    if (!doesUserExistInTable) {
      await IgnoreDisconnect.insertMany({ userId: user.id })
      interaction.reply('User Added')
    } else {
      interaction.reply('User already added')
    }
	}
}
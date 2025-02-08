const {  SlashCommandBuilder } = require('@discordjs/builders')
const IgnoreDisconnect = require('../models/IgnoreDisconnect')
const { messages, permissionNames } = require('../strings')
const BotPermissions = require('../models/BotPermissions')

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
    const commandRunner = interaction.user.id
    const hasPerms = await BotPermissions.findOne({name: permissionNames.addIgnoreDisc, userId: commandRunner})

    if (!hasPerms || !hasPerms.value) {
      interaction.reply(messages.permissionDenied)
    } else {
      const doesUserExistInTable = await IgnoreDisconnect.findOne({userId: user.id})
  
      if (!doesUserExistInTable) {
        await IgnoreDisconnect.insertMany({ userId: user.id })
        interaction.reply(messages.userAddedToAID)
      } else {
        interaction.reply(messages.userExistsInAID)
      }
    }
	}
}
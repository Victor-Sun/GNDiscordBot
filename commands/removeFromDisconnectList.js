const {  SlashCommandBuilder } = require('@discordjs/builders')
const ShouldBeDisconnected = require('../models/ShouldBeDisconnected')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removedisconnectuser')
		.setDescription('Removes the user from the disconnect list')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Name of the user to disconnect')
            .setRequired(true)
        ),
	async execute(interaction) {
        const userId = interaction.options.getUser('user').id
        const textChannel = interaction.channel
        const discordServerId = interaction.guildId

        const shouldBeDisconnected = await ShouldBeDisconnected.findOne({ userId: userId, guildId: discordServerId })

        await interaction.reply('Running Command')
        interaction.deleteReply()

        if (shouldBeDisconnected) {
            await ShouldBeDisconnected.findOneAndDelete({ userId: userId, guildId: discordServerId })
            textChannel.send('User was removed from the disconnect list.')
        } else {
            textChannel.send('User is not currently being disconnected.')
        }
	}
}
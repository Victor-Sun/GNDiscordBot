const {  SlashCommandBuilder } = require('@discordjs/builders')
const ShouldBeDisconnected = require('../models/ShouldBeDisconnected')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnectuser')
		.setDescription('Disconnect the user from discord for 5 minutes')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Name of the user to disconnect')
            .setRequired(true)
        ),
	async execute(interaction) {
        const userId = interaction.options.getUser('user').id
        const discordServerId = interaction.guildId
        const until = new Date().valueOf() + 300000

        const shouldBeDisconnected = await ShouldBeDisconnected.findOne({ userId: userId, guildId: discordServerId })

        if (shouldBeDisconnected && shouldBeDisconnected.until > new Date()) {
            interaction.reply('User is already being disconnected. Quit being such a dick.')
        } else {
            if (shouldBeDisconnected) {
                await ShouldBeDisconnected.deleteOne({userId: userId, guildId: discordServerId })
            }
            await ShouldBeDisconnected.insertMany({ userId: userId, guildId: discordServerId, until: until })
            interaction.reply(interaction.options.getUser('user').username + ' will be disconnected until ' + new Date(until))
            if (interaction.guild.members.cache.get(userId).voice.channel) {
                interaction.guild.members.cache.get(userId).voice.disconnect()
            }
        }
	}
}
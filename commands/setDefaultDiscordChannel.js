const {  SlashCommandBuilder } = require('@discordjs/builders')
const DiscordDefaultChannel = require('../models/DiscordDefaultChannel')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setdefaultchannel')
		.setDescription('Set default channel for current discord for bot')
        .addChannelOption(option => option
            .setName('channelname')
            .setDescription('Name of the channel to set as default')
            .setRequired(true)
        ),
	async execute(interaction) {
        const channel = interaction.options.getChannel('channelname')
        const channelId = channel.id
        const discordId = channel.guildId

        const doesDefaultChannelExist = await DiscordDefaultChannel.findOne({discordId: discordId})
        if (doesDefaultChannelExist) {
          await DiscordDefaultChannel.updateOne({discordId: discordId}, {channelId: channelId})
          interaction.reply(`<#${channelId}> is updated as my home`)
        } else {
          await DiscordDefaultChannel.insertMany({channelId: channelId, discordId: discordId })
          interaction.reply(`<#${channelId}> is set as my home`)
        }
	}
}
const {  SlashCommandBuilder } = require('@discordjs/builders')
const { Interaction } = require('discord.js')
const ShouldBeDisconnected = require('../models/ShouldBeDisconnected')
const BotSettings = require('../models/BotSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnectuser')
        .setDescription('Disconnect the user from discord for 1 minute')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Name of the user to disconnect')
            .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const victimId = interaction.options.getUser('user').id
            const victimName = interaction.options.getUser('user').username
            const discordServerId = interaction.guildId
            const textChannel = interaction.channel
            const until = new Date().valueOf() + 60000
    
            await interaction.reply('Command received')
            interaction.deleteReply()
    
            // Check to see if the disconnect user command is enabled
            const shouldBeDisconnectedSetting = await BotSettings.findOne({ name: 'shouldBeDisconnectedCommand'});
            if (!shouldBeDisconnectedSetting) {
                await BotSettings.insertMany({name: 'shouldBeDisconnectedCommand', value: true})
            }

            if (shouldBeDisconnectedSetting.value === false) {
                return textChannel.send('Command disabled')
            } else {
                // Checks if the user is already in the disconnect list
                const shouldBeDisconnected = await ShouldBeDisconnected.findOne({ userId: victimId, guildId: discordServerId })

                if (shouldBeDisconnected && shouldBeDisconnected.until > new Date()) {
                    textChannel.send(`<@${victimId}> is already being disconnected. Quit being such a dick.`)
                } else {
                    if (shouldBeDisconnected) {
                        await ShouldBeDisconnected.deleteOne({userId: victimId, guildId: discordServerId })
                    }

                    await ShouldBeDisconnected.insertMany({ userId: victimId, guildId: discordServerId, until: until })
                    textChannel.send(`<@${victimId}> will be disconnected until ${new Date(until)}`)

                    if (interaction.guild.members.cache.get(victimId).voice.channel) {
                        interaction.guild.members.cache.get(victimId).voice.disconnect()
                    }
                }
            }
        } catch (error) {
            console.error(error)
            interaction.deleteReply()
            interaction.channel.send('An error occursed while running the command')
        }
    }
}
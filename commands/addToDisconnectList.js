const {  SlashCommandBuilder } = require('@discordjs/builders')
const ShouldBeDisconnected = require('../models/ShouldBeDisconnected')
const BotSettings = require('../models/BotSettings')
const BotPermissions = require('../models/BotPermissions')
const { messages, permissionNames, commandName } = require('../strings')

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
            const commandRunner = interaction.user.id
            const hasPerms = await BotPermissions.findOne({name: permissionNames.addIgnoreDisc, userId: commandRunner})
            if (!hasPerms || !hasPerms.value) {
                interaction.reply(messages.permissionDenied)
            } else {
                const victimId = interaction.options.getUser('user').id
                // const victimName = interaction.options.getUser('user').username
                const discordServerId = interaction.guildId
                const textChannel = interaction.channel
                const until = new Date().valueOf() + 60000

                await interaction.reply(messages.commandReceived)
                interaction.deleteReply()
        
                // Check to see if the disconnect user command is enabled
                const shouldBeDisconnectedEnabled = await BotSettings.findOne({ name: commandName.shouldBeDisconnected });
                if (!shouldBeDisconnectedEnabled) {
                    await BotSettings.insertMany({name: commandName.shouldBeDisconnected, value: true})
                }
    
                if (shouldBeDisconnectedEnabled.value === false) {
                    return textChannel.send(messages.commandDisabled)
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
            }
        } catch (error) {
            console.error(error)
            interaction.deleteReply()
            interaction.channel.send('An error occursed while running the command')
        }
    }
}
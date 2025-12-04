const {  SlashCommandBuilder } = require('@discordjs/builders')
const BotSettings = require('../models/BotSettings')
const { messages, commandName } = require('../strings')

module.exports = {
	data: new SlashCommandBuilder()
        .setName('spammove')
        .setDescription('Spam move user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Name of the user to spam move')
            .setRequired(true)
        )
        .addIntegerOption(amount => amount
            .setName('amount')
            .setDescription('Amount of times to spam move the user')
            .setRequired(true)
        ),
	async execute(interaction) {
        const textChannel = interaction.channel

        // BotSettings gate
        let moveSpamSetting = await BotSettings.findOne({ name: commandName.moveSpam })
        if (!moveSpamSetting) {
            await BotSettings.insertMany({ name: commandName.moveSpam, value: true })
            moveSpamSetting = await BotSettings.findOne({ name: commandName.moveSpam })
        }

        if (!moveSpamSetting.value) {
            return textChannel.send(messages.commandDisabled)
        }

        const channels = await interaction.member.guild.channels.fetch()
            const victimId = interaction.options.getUser('user').id
            let moveAmount = interaction.options.getInteger('amount')
            
            if (moveAmount > 15) {
                moveAmount = 15
            }
    
            const channelIds = []
            for (const channel of channels.values()) {
                if(channel.type === 'GUILD_VOICE') {
                    channelIds.push(channel.id)
                }
            }
    
            let moveSuccess = true

            if (interaction.guild.members.cache.get(victimId).voice.channel) {
                let moveCount = 0
                while(moveCount < moveAmount) {
                    if (interaction) {
                        if (interaction.guild.members.cache.get(victimId).voice.channel) {
                            const randomChannel = Math.floor(Math.random() * channelIds.length)
                            if (randomChannel !== interaction.guild.members.cache.get(victimId).voice.channelId) {
                                await interaction.guild.members.cache.get(victimId).voice.setChannel(channelIds[randomChannel])
                                moveCount++
                            }
                        } else {
                            moveSuccess = false
                            break
                        }
                    } else {
                        moveSuccess = false
                        break
                    }
                }
                if (moveSuccess) {
                    textChannel.send(`<@${victimId}> has been given aids.`)
                } else {
                    textChannel.send(`<@${victimId}> is not connected to a voice channel.`)
                }
            } else {
                textChannel.send(`<@${victimId}> is not connected to a voice channel.`)
            }
	}
}

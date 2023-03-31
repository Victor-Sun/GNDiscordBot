const {  SlashCommandBuilder } = require('@discordjs/builders')
const BotSettings = require('../models/BotSettings')

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
        const moveSpam = await BotSettings.findOne({ name: 'moveSpam'})

        if (!moveSpam) {
            await BotSettings.insertMany({name: 'moveSpam', value: true})
        }

        if (moveSpam.value === false) {
            interaction.reply('Command disabled')
        } else {
            const channels = await interaction.member.guild.channels.fetch()
            const victimId = interaction.options.getUser('user').id
            let moveAmount = interaction.options.getInteger('amount')
            
            if (moveAmount > 30) {
                moveAmount = 30
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
                    interaction.reply(`<@${victimId}> has been given aids.`)
                } else {
                    interaction.reply(`<@${victimId}> is not connected to a voice channel.`)
                }
            } else {
                interaction.reply(`<@${victimId}> is not connected to a voice channel.`)
            }
        }
	}
}
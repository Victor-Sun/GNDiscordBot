const {  SlashCommandBuilder } = require('@discordjs/builders')
const BotSettings = require('../models/BotSettings')

module.exports = {
	data: new SlashCommandBuilder()
        .setName('spammoveall')
        .setDescription('Spam move all users')
        .addIntegerOption(amount => amount
            .setName('amount')
            .setDescription('Amount of times to spam move')
            .setRequired(true)
        ),
	async execute(interaction) {
        const moveSpam = await BotSettings.findOne({ name: 'moveSpam'})
        const textChannel = interaction.channel

        if (!moveSpam) {
            await BotSettings.insertMany({name: 'moveSpam', value: true})
        }

        if (moveSpam.value === false) {
            textChannel.send('Command disabled')
        } else {
            const channels = await interaction.member.guild.channels.fetch()
            const connectedUserIds = []
            for(const ch of channels) {
                if (ch[1].type === 'GUILD_VOICE') {
                    ch[1].members.map(memberList => {
                        if (memberList.user) {
                            connectedUserIds.push(memberList.user.id)
                        }
                    })
                }
            }

            connectedUserIds.forEach(async victimId => {
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
                }
            })
            textChannel.send(`Everyone has been given aids.`)
        }
	}
}
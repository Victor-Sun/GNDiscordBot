const {  SlashCommandBuilder } = require('@discordjs/builders')
// const BotSettings = require('../models/BotSettings')
// const BotPermissions = require('../models/BotPermissions')
const { permissionNames, messages, commandName } = require('../strings')

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
        const moveSpamEnabled = await BotSettings.findOne({ name: commandName.moveSpamAll })
        const textChannel = interaction.channel
        // const commandRunner = interaction.user.id
        // const hasPerms = await BotPermissions.findOne({name: permissionNames.moveSpamAll, userId: commandRunner })

        // if (!hasPerms || !hasPerms.value) {
        //     interaction.reply(messages.permissionDenied)
        // } else {
            if (!moveSpamEnabled) {
                await BotSettings.insertMany({name: commandName.moveSpamAll, value: true })
            }
    
            if (moveSpamEnabled.value === false) {
                textChannel.send(messages.commandDisabled)
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
                
                    if (moveAmount > 5) {
                        moveAmount = 5
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
                textChannel.send(messages.everyoneGivenAids)
            }
        }
	}
// }
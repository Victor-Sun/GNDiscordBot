const BotSettings = require('../models/BotSettings');
const DiscordDefaultChannel = require('../models/DiscordDefaultChannel');
const IgnoreDisconnect = require('../models/IgnoreDisconnect');
const ShouldBeDisconnected = require('../models/ShouldBeDisconnected')

module.exports = {
	name: 'voiceStateUpdate',
	on: true,
	async execute(oldState, newState) {
        const autoDisconnectForDisconnect = await BotSettings.findOne({ name: 'autoDisconnectForDisconnect' })
        if (autoDisconnectForDisconnect.value) {
            if (!newState.channelId) {
                const fetchedLogs = await oldState.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_DISCONNECT',
                });

                const { executor, createdAt } = fetchedLogs.entries.sort((a, b) => b.createdAt - a.createdAt).first();
                const ignoreDisconnect = await IgnoreDisconnect.findOne({ userId: executor.id })

                // TODO: This isn't the best way but it seems to be the only way.
                // Check if it happened in the past.(Now - past = positive)
                if ((new Date().valueOf() - createdAt > 0) && (new Date().valueOf() - createdAt < 6000))  {
                    if (!ignoreDisconnect) {
                        const discordId = newState.guild.id
                        const until = new Date().valueOf() + 60000
                        
                        const alreadyBeingDisconnected = await ShouldBeDisconnected.findOne({ userId: executor.id, guildId: discordId})
                        const defaultChannel = await DiscordDefaultChannel.findOne({discordId: discordId})
    
                        if (defaultChannel) {
                            if (alreadyBeingDisconnected && alreadyBeingDisconnected.until > new Date()) {
                                newState.guild.channels.cache.filter(e => e.type === 'GUILD_TEXT').find(f => f.id === defaultChannel.channelId).send(`Since <@${executor.id}> decided to disconnect someone they will be 
                                disconnected until ${new Date(until)}`)
                                await ShouldBeDisconnected.deleteOne({ userId: executor.id, guildId: discordId})
                                await ShouldBeDisconnected.insertMany({ userId: executor.id, guildId: discordId, until: until })
                            } else {
                                newState.guild.channels.cache.filter(e => e.type === 'GUILD_TEXT').find(f => f.id === defaultChannel.channelId).send(`Since <@${executor.id}> decided to disconnect someone they will be disconnected until ${new Date(until)}`)
                                await ShouldBeDisconnected.insertMany({ userId: executor.id, guildId: discordId, until: until })
                            }
                        }
    
                        if (newState.guild.members.cache.get(executor.id) && newState.guild.members.cache.get(executor.id).voice && newState.guild.members.cache.get(executor.id).voice.channel) {
                            newState.guild.members.cache.get(executor.id).voice.disconnect()
                        }
                    }
                }
            }
        }
        const userId = newState.member.user.id
        const guildId = newState.guild.id

        // TODO: Add setting here to check if the setting is disabled 
        const shouldBeDisconnected = await ShouldBeDisconnected.findOne({ userId: userId, guildId: guildId })
        if (shouldBeDisconnected && shouldBeDisconnected.until > new Date()) {
            newState.member.voice.disconnect()
        }
        
    },
};

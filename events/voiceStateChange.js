const ShouldBeDisconnected = require('../models/ShouldBeDisconnected')

module.exports = {
	name: 'voiceStateUpdate',
	on: true,
	async execute(oldState, newState) {
        if (!newState.channelId) return

        const userId = newState.member.user.id
        const guildId = newState.guild.id

        const shouldBeDisconnected = await ShouldBeDisconnected.findOne({ userId: userId, guildId: guildId })
        if (shouldBeDisconnected && shouldBeDisconnected.until > new Date()) {
            newState.member.voice.disconnect()
        }

        console.log(newState)
    },
};

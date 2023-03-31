const {  SlashCommandBuilder } = require('@discordjs/builders')

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
		const channels = await interaction.member.guild.channels.fetch()
        const victimId = interaction.options.getUser('user').id
        let moveAmount = interaction.options.getInteger('amount')
        
        if (moveAmount > 10) {
            moveAmount = 10
        }

        const channelIds = []
        for (const channel of channels.values()) {
            if(channel.type === 'GUILD_VOICE') {
                channelIds.push(channel.id)
            }
        }

        if (interaction.guild.members.cache.get(victimId).voice.channel) {
            let moveCount = 0
            while(moveCount < moveAmount) {
                const randomChannel = Math.floor(Math.random() * channelIds.length)
                if (randomChannel !== interaction.guild.members.cache.get(victimId).voice.channelId) {
                    await interaction.guild.members.cache.get(victimId).voice.setChannel(channelIds[randomChannel])
                    moveCount++
                }
            }

            interaction.reply(`<@${victimId}> has been given aids.`)
        }
	}
}
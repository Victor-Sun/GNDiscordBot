const {  SlashCommandBuilder } = require('@discordjs/builders')
const WowBlacklist = require('../models/WowBlacklist');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getblacklist')
		.setDescription('Get the formatted M+ blacklist'),
        async execute(interaction) {
            try {
                await interaction.reply('Generating blacklist')
                const blacklistArray = await WowBlacklist.find({})
                let formattedBlacklist = ''

                blacklistArray.forEach((e, i) => {
                    if (i < blacklistArray.length - 1) {
                        formattedBlacklist += `${e.ign}-${e.realm}, `
                    } else {
                        formattedBlacklist += `${e.ign}-${e.realm}`
                    }
                })
                
                if(!formattedBlacklist) {
                    await interaction.editReply('Nobody in the blacklist')
                } else {
                    await interaction.editReply(formattedBlacklist)
                }
            } catch (error) {
                interaction.reply('Invalid URL')
            }
	}
}
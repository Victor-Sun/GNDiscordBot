const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with a message becuase you pinged the bot!'),
	async execute(interaction) {
		await interaction.reply(`Don't ping me whorerer! 凸(艹皿艹 )`)
	},
}
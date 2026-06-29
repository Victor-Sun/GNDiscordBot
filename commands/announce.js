const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('announce')
		.setDescription('Post an announcement in this channel')
		.addStringOption(option => option
			.setName('message')
			.setDescription('The announcement message')
			.setRequired(true))
		.addStringOption(option => option
			.setName('title')
			.setDescription('Title for the announcement embed')
			.setRequired(false)),
	async execute(interaction) {
		const title = interaction.options.getString('title') ?? 'Announcement';
		const message = interaction.options.getString('message');

		const embed = new MessageEmbed()
			.setColor('#5865F2')
			.setTitle(title)
			.setDescription(message)
			.setFooter({ text: `Announced by ${interaction.user.tag}` })
			.setTimestamp();

		await interaction.channel.send({
			content: '@everyone',
			embeds: [embed],
			allowedMentions: { parse: ['everyone'] },
		});
		await interaction.reply({ content: 'Announcement posted.', ephemeral: true });
	},
};

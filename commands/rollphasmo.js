const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('rollphasmo').setDescription('Rolls a random Phasmophobia Item'),
	execute(interaction) {
		const buttons = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('roll').setLabel('Roll').setStyle('PRIMARY'),
			new MessageButton().setCustomId('reset').setLabel('Reset').setStyle('DANGER')
		);

		const embededMessage = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Phasmophobia Roulette')
			.setURL('https://store.steampowered.com/app/739630/Phasmophobia/')
			.setDescription('Roulette for rolling Phasmophobia items')
			.setThumbnail('https://coelho.ninja/zaDjQsCxx0NcpPQp6ZjALUvmQw8=')
			.addFields({ name: 'Rolled Items', value: '\u200B' }, { name: '\u200B', value: '\u200B' })
			.setImage('https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg?t=1638041534')
			.setTimestamp();

		

		interaction.channel.send({ embeds: [embededMessage], components: [buttons] });
		interaction.reply({ content: 'Roulette Started!', ephemeral: true });
	},
};

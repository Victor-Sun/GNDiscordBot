const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const REACTIONS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll in this channel')
		.addStringOption(option => option
			.setName('question')
			.setDescription('The poll question')
			.setRequired(true))
		.addStringOption(option => option
			.setName('options')
			.setDescription('Comma-separated choices (2–10 options)')
			.setRequired(true)),
	async execute(interaction) {
		const question = interaction.options.getString('question');
		const options = interaction.options.getString('options')
			.split(',')
			.map(option => option.trim())
			.filter(Boolean);

		if (options.length < 2) {
			return interaction.reply({
				content: 'Please provide at least 2 options, separated by commas.',
				ephemeral: true,
			});
		}

		if (options.length > REACTIONS.length) {
			return interaction.reply({
				content: `Please provide at most ${REACTIONS.length} options, separated by commas.`,
				ephemeral: true,
			});
		}

		const optionList = options
			.map((option, index) => `${REACTIONS[index]} ${option}`)
			.join('\n');

		await interaction.deferReply({ ephemeral: true });

		const embed = new EmbedBuilder()
			.setColor('#5865F2')
			.setTitle('📊 Poll')
			.setDescription(`**${question}**\n\n${optionList}\n\nReact to vote!`)
			.setFooter({ text: `Poll by ${interaction.user.tag}` })
			.setTimestamp();

		const pollMessage = await interaction.channel.send({ embeds: [embed] });

		await Promise.all(
			options.map((_, index) => pollMessage.react(REACTIONS[index]))
		);

		await interaction.editReply({ content: 'Poll created.' });
	},
};

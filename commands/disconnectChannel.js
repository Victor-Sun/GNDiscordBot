const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('disconnectchannel')
        .setDescription('Disconnect all users in a specific voice channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Voice channel whose members will be disconnected')
            .setRequired(true)
        ),
	async execute(interaction) {
        const textChannel = interaction.channel;
        const targetChannel = interaction.options.getChannel('channel');

        if (!targetChannel || targetChannel.type !== 'GUILD_VOICE') {
            return interaction.reply({ content: 'Please select a voice channel.', ephemeral: true });
        }

        const members = Array.from(targetChannel.members.values());

        if (members.length === 0) {
            return interaction.reply({ content: `No users connected to <#${targetChannel.id}>.`, ephemeral: true });
        }

        let disconnectedCount = 0;

        for (const member of members) {
            try {
                if (member.voice && member.voice.channel) {
                    await member.voice.disconnect();
                    disconnectedCount++;
                }
            } catch (err) {
                console.error(`Failed to disconnect ${member.user?.tag || member.id}:`, err);
            }
        }

        if (disconnectedCount === 0) {
            return interaction.reply({ content: `No users could be disconnected from <#${targetChannel.id}>.`, ephemeral: true });
        }

        await interaction.reply({ content: `Disconnected **${disconnectedCount}** user(s) from <#${targetChannel.id}>.`, ephemeral: false });
        if (textChannel && textChannel.id !== interaction.channelId) {
            textChannel.send(`Disconnected **${disconnectedCount}** user(s) from <#${targetChannel.id}>.`);
        }
    }
};
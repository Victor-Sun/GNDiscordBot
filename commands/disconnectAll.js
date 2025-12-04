const { SlashCommandBuilder } = require('@discordjs/builders');
const BotSettings = require('../models/BotSettings');
const { messages, commandName } = require('../strings');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('disconnectall')
        .setDescription('Disconnect all users in all voice channels on this server'),
	async execute(interaction) {
        const guild = interaction.guild;
        const textChannel = interaction.channel;

        // BotSettings gate
        let disconnectAllSetting = await BotSettings.findOne({ name: commandName.disconnectAll });
        if (!disconnectAllSetting) {
            await BotSettings.insertMany({ name: commandName.disconnectAll, value: true });
            disconnectAllSetting = await BotSettings.findOne({ name: commandName.disconnectAll });
        }

        if (!disconnectAllSetting.value) {
            return textChannel.send(messages.commandDisabled);
        }

        if (!guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const channels = await guild.channels.fetch();

        // Collect unique members from all voice channels
        const membersToDisconnect = new Map();

        for (const channel of channels.values()) {
            if (channel.type === 'GUILD_VOICE') {
                for (const member of channel.members.values()) {
                    if (member && member.id && !membersToDisconnect.has(member.id)) {
                        membersToDisconnect.set(member.id, member);
                    }
                }
            }
        }

        if (membersToDisconnect.size === 0) {
            return interaction.reply({ content: 'No users are connected to any voice channels.', ephemeral: true });
        }

        let disconnectedCount = 0;

        for (const member of membersToDisconnect.values()) {
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
            return interaction.reply({ content: 'No users could be disconnected from voice channels.', ephemeral: true });
        }

        await interaction.reply({ content: `Disconnected **${disconnectedCount}** user(s) from all voice channels.`, ephemeral: false });
    }
};
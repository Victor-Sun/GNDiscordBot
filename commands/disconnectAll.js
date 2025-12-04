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

        // Acknowledge the interaction then delete the reply so the visible message
        // is a normal channel message without the "Used /command" bar.
        await interaction.reply({ content: ' ', ephemeral: true });
        await interaction.deleteReply();

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
            return textChannel.send('This command can only be used in a server.');
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
            return textChannel.send('No users are connected to any voice channels.');
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
            return textChannel.send('No users could be disconnected from voice channels.');
        }

        await textChannel.send(`Disconnected **${disconnectedCount}** user(s) from all voice channels.`);
    }
};
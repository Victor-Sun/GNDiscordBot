const { SlashCommandBuilder } = require('@discordjs/builders');
const BotSettings = require('../models/BotSettings');
const { messages, commandName } = require('../strings');

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

        // Acknowledge the interaction then delete the reply so the visible message
        // is a normal channel message without the "Used /command" bar.

        // BotSettings gate
        let disconnectChannelSetting = await BotSettings.findOne({ name: commandName.disconnectChannel });
        if (!disconnectChannelSetting) {
            await BotSettings.insertMany({ name: commandName.disconnectChannel, value: true });
            disconnectChannelSetting = await BotSettings.findOne({ name: commandName.disconnectChannel });
        }

        if (!disconnectChannelSetting.value) {
            return textChannel.send(messages.commandDisabled);
        }

        const targetChannel = interaction.options.getChannel('channel');

        if (!targetChannel || targetChannel.type !== 'GUILD_VOICE') {
            return textChannel.send('Please select a voice channel.');
        }

        const members = Array.from(targetChannel.members.values());

        if (members.length === 0) {
            return textChannel.send(`No users connected to <#${targetChannel.id}>.`);
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
            return textChannel.send(`No users could be disconnected from <#${targetChannel.id}>.`);
        }

        await textChannel.send(`Disconnected **${disconnectedCount}** user(s) from <#${targetChannel.id}>.`);
        if (textChannel && textChannel.id !== interaction.channelId) {
            textChannel.send(`Disconnected **${disconnectedCount}** user(s) from <#${targetChannel.id}>.`);
        }
        await interaction.deleteReply();
    }
};
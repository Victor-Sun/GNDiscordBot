const { SlashCommandBuilder } = require('@discordjs/builders');
const BotSettings = require('../models/BotSettings');
const BotPermissions = require('../models/BotPermissions');
const { messages, permissionNames, commandName } = require('../strings');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('setcommandsetting')
        .setDescription('Enable or disable specific bot commands')
        .addStringOption(option => option
            .setName('command')
            .setDescription('Command to configure')
            .setRequired(true)
            .addChoices([
                ['spammove', commandName.moveSpam],
                ['spammoveall', commandName.moveSpamAll],
                ['spammovechannel', commandName.moveSpamChannel],
                ['disconnectall', commandName.disconnectAll],
                ['disconnectchannel', commandName.disconnectChannel],
                ['disconnectuser', commandName.shouldBeDisconnected]
            ])
        )
        .addIntegerOption(option => option
            .setName('enabled')
            .setDescription('1 = enabled, 0 = disabled')
            .setRequired(true)
            .addChoices([
                ['Enabled', 1],
                ['Disabled', 0]
            ])
        ),
	async execute(interaction) {
        const commandKey = interaction.options.getString('command');
        const enabledInt = interaction.options.getInteger('enabled');
        const enabled = !!enabledInt;
        const commandRunner = interaction.user.id;

        // Require editBotPerms permission
        const hasPerms = await BotPermissions.findOne({ name: permissionNames.editBotPerms, userId: commandRunner });
        if (!hasPerms || !hasPerms.value) {
            return interaction.reply({ content: messages.permissionDenied, ephemeral: true });
        }

        try {
            const existing = await BotSettings.findOne({ name: commandKey });

            if (!existing) {
                await BotSettings.insertMany({ name: commandKey, value: enabled });
            } else {
                await BotSettings.updateOne({ name: commandKey }, { name: commandKey, value: enabled });
            }

            return interaction.reply({
                content: `Setting for **${commandKey}** updated to **${enabled ? 'enabled' : 'disabled'}**.`,
                ephemeral: true,
            });
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: 'An error occurred while updating the command setting.',
                ephemeral: true,
            });
        }
    }
};
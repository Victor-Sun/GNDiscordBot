module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        const guildName = interaction.guild?.name || 'DM';
        const channelName = interaction.channel?.name || 'DM';
        console.log(`[COMMAND] ${interaction.commandName} used by ${interaction.user.tag} (${interaction.user.id}) in ${guildName}/${channelName}`);

        try {
            await command.execute(interaction);
        } catch (err) {
            if (err) console.error(err);

            const errorMessage = {
                content: 'An error occured while executing that command.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage).catch(() => {});
            } else {
                await interaction.reply(errorMessage).catch(() => {});
            }
        }
    },
};

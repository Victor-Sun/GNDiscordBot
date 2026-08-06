const { SlashCommandBuilder } = require('@discordjs/builders');
const OpenAI = require('openai');
const config = require('../config.js');

const DISCORD_MESSAGE_LIMIT = 2000;

function truncateForDiscord(text) {
    if (text.length <= DISCORD_MESSAGE_LIMIT) {
        return text;
    }

    return `${text.slice(0, DISCORD_MESSAGE_LIMIT - 3)}...`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Ask AI a question')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('Your message to the AI')
                .setRequired(true)),
    async execute(interaction) {
        if (!config.OPENAI_API_KEY) {
            return interaction.reply({
                content: 'AI is not configured. Add OPENAI_API_KEY to your environment.',
                ephemeral: true,
            });
        }

        const prompt = interaction.options.getString('prompt');
        const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

        await interaction.deferReply();

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
            });

            const reply = completion.choices[0]?.message?.content;

            if (!reply) {
                return interaction.editReply('The AI returned an empty response.');
            }

            await interaction.editReply(truncateForDiscord(reply));
        } catch (err) {
            console.error('ai command failed:', err);
            await interaction.editReply('Something went wrong talking to the AI.');
        }
    },
};

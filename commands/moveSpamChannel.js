const {  SlashCommandBuilder } = require('@discordjs/builders');
const BotSettings = require('../models/BotSettings');
const { messages, commandName } = require('../strings');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('spammovechannel')
        .setDescription('Spam move all users in a specific voice channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Voice channel whose members will be spam moved')
            .setRequired(true)
        )
        .addIntegerOption(amount => amount
            .setName('amount')
            .setDescription('Amount of times to spam move each user')
            .setRequired(true)
        ),
	async execute(interaction) {
        const textChannel = interaction.channel;

        // Acknowledge the interaction then delete the reply so the visible message
        // is a normal channel message without the "Used /command" bar.
        await interaction.reply({ content: ' ', ephemeral: true });
        await interaction.deleteReply();

        // BotSettings gate
        let moveSpamChannelSetting = await BotSettings.findOne({ name: commandName.moveSpamChannel });
        if (!moveSpamChannelSetting) {
            await BotSettings.insertMany({ name: commandName.moveSpamChannel, value: true });
            moveSpamChannelSetting = await BotSettings.findOne({ name: commandName.moveSpamChannel });
        }

        if (!moveSpamChannelSetting.value) {
            return textChannel.send(messages.commandDisabled);
        }

        const targetChannel = interaction.options.getChannel('channel');

        if (!targetChannel || targetChannel.type !== 'GUILD_VOICE') {
            return textChannel.send('Please select a voice channel.');
        }

        // Fetch all guild channels so we can pick random voice channels to move to
        const channels = await interaction.member.guild.channels.fetch();

        // Collect users connected to the specified voice channel only
        const connectedUserIds = [];
        targetChannel.members.forEach(member => {
            if (member.user) {
                connectedUserIds.push(member.user.id);
            }
        });

        if (connectedUserIds.length === 0) {
            return textChannel.send(`No users connected to <#${targetChannel.id}>.`);
        }

        connectedUserIds.forEach(async victimId => {
            let moveAmount = interaction.options.getInteger('amount');

            // Hard cap to avoid excessive moves
            if (moveAmount > 5) {
                moveAmount = 5;
            }

            const channelIds = [];
            for (const channel of channels.values()) {
                if (channel.type === 'GUILD_VOICE') {
                    channelIds.push(channel.id);
                }
            }

            let moveSuccess = true;

            if (interaction.guild.members.cache.get(victimId).voice.channel) {
                let moveCount = 0;
                while (moveCount < moveAmount) {
                    if (interaction) {
                        const member = interaction.guild.members.cache.get(victimId);
                        if (member && member.voice && member.voice.channel) {
                            const randomChannelIndex = Math.floor(Math.random() * channelIds.length);
                            const randomChannelId = channelIds[randomChannelIndex];

                            if (randomChannelId !== member.voice.channelId) {
                                await member.voice.setChannel(randomChannelId);
                                moveCount++;
                            }
                        } else {
                            moveSuccess = false;
                            break;
                        }
                    } else {
                        moveSuccess = false;
                        break;
                    }
                }
            } else {
                moveSuccess = false;
            }
        });

        textChannel.send(`All users in <#${targetChannel.id}> have been given aids.`);
    }
};

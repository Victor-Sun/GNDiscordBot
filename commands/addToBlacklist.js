const {  SlashCommandBuilder } = require('@discordjs/builders')
const WowBlacklist = require('../models/WowBlacklist');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addblacklist')
		.setDescription('Add user to M+ blacklist')
        .addStringOption(option => option
            .setName('raiderio')
            .setDescription('Players Raider.IO URL')
            .setRequired(true)
        ),
	async execute(interaction) {
        try {
            const raiderIo = interaction.options.getString('raiderio');
            const raiderIoSplit = raiderIo.split('?')[0]

            const splitRaiderIo = raiderIoSplit.split('/')
            const ign = decodeURI(splitRaiderIo[splitRaiderIo.length - 1])
            const realm = splitRaiderIo[splitRaiderIo.length - 2]

            let realmName = ''
            realm.split('-').forEach(e => {
                realmName += e.charAt(0).toUpperCase() + e.slice(1)
            })

            const alreadyInDb = await WowBlacklist.findOne({ ign: ign, realmName: realmName });
            if (alreadyInDb) {
                await interaction.reply('Player already in the blacklist');
            } else {
                await WowBlacklist.insertMany({ign: ign, realm: realmName, added_by_username: interaction.user.username, added_by_id: interaction.user.id});
                await interaction.reply('Player added to blacklist');
            }
        } catch (error) {
            interaction.reply('Invalid URL')
        }
	}
}
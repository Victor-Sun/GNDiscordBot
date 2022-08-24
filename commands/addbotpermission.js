const {  SlashCommandBuilder } = require('@discordjs/builders')
const BotPermissions = require('../models/BotPermissions')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setbotpermission')
		.setDescription('Set user permissions for bot command')
        .addStringOption(option => option
            .setName('permissionname')
            .setDescription('Name of the command to add the permission for')
            .setRequired(true)
        )
        .addUserOption(option => option
            .setName('user')
            .setDescription('Name of the user to add the permission for')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('permissionbool')
            .setDescription('True or False if the user can use the permission')
            .addChoices([['True', 1], ['False', 0]])
            .setRequired(true)
        ),
	async execute(interaction) {
        const name = interaction.options.getString('permissionname')
        const user = interaction.options.getUser('user')
        const bool = !!interaction.options.getInteger('permissionbool')
        const doesUserPermissionExist = await BotPermissions.findOne({ name: name, userId: user.id })

        if (!doesUserPermissionExist) {
            await BotPermissions.insertMany({ name: name, userId: user.id, value: bool })
            interaction.reply('Permission Added')
        } else {
            await BotPermissions.updateOne({ name: name, userId: user.id }, { name: name, userId: user.id, value: bool })
            interaction.reply('Permission Updated')
        }
	}
}
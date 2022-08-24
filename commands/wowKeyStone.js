const {  SlashCommandBuilder } = require('@discordjs/builders');
const { getBlizzardApiKey } = require('../helpers/AuthHelpers.js');
const fetch = require("node-fetch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wowkeystone')
		.setDescription('Get wow keystone for character'),
	async execute(interaction) {
        const token = await getBlizzardApiKey()

        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        }
        const url = `https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us&locale=en_US&access_token=${token}`
        const resp = await fetch(url, requestOptions)
        const res = await resp.json()

		interaction.reply(`Wow token price is: ${res.price / 10000}G`)
	}
};

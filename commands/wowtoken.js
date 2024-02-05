const { SlashCommandBuilder } = require('@discordjs/builders');
const { getBlizzardApiKey } = require('../helpers/AuthHelpers.js');
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wowtoken')
        .setDescription('Get wow token price in gold'),
    async execute(interaction) {
        const token = await getBlizzardApiKey()

        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        }
        const url = `https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us&locale=en_US&access_token=${token}`
        const resp = await fetch(url, requestOptions)
        const res = await resp.json()

        interaction.reply(`Wow token price is: ${shortenGold(res.price / 10000)}G`)
    }

};

function shortenGold(num, fixed) {
    if (num === null) return null
    if (num === 0) return '0'
    fixed = (!fixed || fixed < 0) ? 0 : fixed
    var b = (num).toPrecision(2).split("e"),
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed),
        d = c < 0 ? c : Math.abs(c),
        e = d + ['', 'K', 'M', 'B', 'T'][k]
    return e
}
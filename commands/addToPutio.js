const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config');
const Tokens = require('../models/Tokens');

const PutioAPI = require('@putdotio/api-client').default
const putioAPI = new PutioAPI({ clientID: config.PUTIO_CLIENT_OAUTH })

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtoputio')
        .setDescription('Add Torrent Magnet Link to Put.io')
        .addStringOption(option => option
            .setName('magnetlink')
            .setDescription('Magnet Link for Torrent')
            .setRequired(true)
        ),
    async execute(interaction) {
        try {
            let token = await Tokens.findOne({service: 'putio'})
            const expiredToken = new Date(token.until).valueOf() < new Date().valueOf + 1000*60*60*12
            token = token.token

            let tokenExists
            if (token) {
                const tokenDb = (await putioAPI.Auth.ValidateToken(token)).body
                tokenExists = tokenDb.result
            }

            if (!tokenExists || expiredToken) {
                await putioAPI.Auth.Login({
                    username: config.PUTIO_USERNAME,
                    password: config.PUTIO_PASSWORD,
                    app: { 
                        client_id: config.PUTIO_CLIENT_ID, 
                        client_secret: config.PUTIO_CLIENT_SECRET}
                }).then(async auth => {
                    token = auth.body.access_token
                    await Tokens.insertMany({ service: 'putio', token: token, until: new Date().valueOf })
                })
            }

            await putioAPI.setToken(token)
            const magnetLink = interaction.options.getString('magnetlink')
            await putioAPI.Transfers.Add({url: magnetLink}).then(response => {
                interaction.reply('Download added')
            }).catch(err => {
                console.log(err)
                interaction.reply('Error adding torrent request')
            })
        } catch (error) {
            console.log(error)
            interaction.reply('Error adding torrent request')
        }
    }
};

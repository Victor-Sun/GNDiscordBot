const config = require('../config.js');
const fetch = require("node-fetch");

module.exports = { 
    async getBlizzardApiKey() {
        const requestOptions = {
            method: 'POST',
            headers: {
                Authorization: `Basic ${config.BLIZZARD_TOKEN}`
            },
            redirect: 'follow'
        }
    
        const resp = await fetch('https://us.battle.net/oauth/token?grant_type=client_credentials', requestOptions)
        const res = await resp.json()
        return res.access_token
    }
}

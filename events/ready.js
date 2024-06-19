const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../config.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client, commands) {
        console.log('Bot is ready.');

        const clientId = client.user.id;
        const rest = new REST({
            version: '9'
        }).setToken(config.TOKEN);

        (async () => {
            try {
                if (config.NODE_ENV === 'production') {
                    await rest.put(Routes.applicationCommands(clientId), {
                        body: commands
                    });
                    console.log(`Successfully registered ${commands.length} commands globally.`);
                } else {
                    await rest.put(Routes.applicationGuildCommands(clientId, config.GUILDID), {
                        body: commands
                    });
                    console.log(`Successfully registered ${commands.length} commands locally.`);
                }
            } catch (err) {
                if (err) console.error(err);
            }
        })();
    },
};

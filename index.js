const fs = require('fs');
const { Client, Intents, Collection, Application } = require('discord.js');
const config = require('./config.js');
const ensureBotSettings = require('./helpers/ensureBotSettings');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ] 
});

require('./config/Database');

// Ensure default BotSettings entries exist for all commands on startup.
(async () => {
    try {
        await ensureBotSettings();
        console.log('Default BotSettings verified.');
    } catch (err) {
        console.error('Failed to ensure default BotSettings on startup:', err);
    }
})();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, commands));
    } else {
        client.on(event.name, (...args) => event.execute(...args, commands));
    }
}

client.login(config.TOKEN);
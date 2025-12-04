# GNDiscordBot

Simple Discord bot that integrates various utilities, moderation helpers, and a few fun commands.

## Slash Commands

### General
- `/ping` – Simple connectivity test. Replies with **Pong!**.
- `/echo <message>` – Echoes the provided message.
- `/test` – Internal test command.

### Voice / Moderation
- `/aid <user>` – Adds a user to the **ignore disconnect** list so they are not auto-disconnected.
- `/disconnectuser <user>` – Disconnects a user from voice for 1 minute and tracks them in the disconnect list.
- `/removedisconnectuser <user>` – Removes a user from the disconnect list.
- `/disconnectall` – Disconnects all users in all voice channels on the server.
- `/disconnectchannel <channel>` – Disconnects all users in a specific voice channel.
- `/spammove <user> <amount>` – Randomly moves a single user between voice channels multiple times.
- `/spammoveall <amount>` – Randomly moves all connected users between voice channels multiple times.
- `/spammovechannel <channel> <amount>` – Randomly moves all users in a specific voice channel multiple times.

### Bot Settings & Permissions
- `/setcommandsetting <command> <enabled>` – Enables or disables specific bot commands (uses the `BotSettings` table).
- `/setbotpermission <permissionname> <user> <permissionbool>` – Grants or revokes bot permissions for a user.
- `/setdefaultchannel <channelname>` – Sets the default text channel used by the bot for the current server.

### Word Replies / TTS
- `/addbotreply <word> <reply>` – Adds a word + reply pair to the database. When the word appears, the bot can reply via TTS.
- `/editbotreply <word> <reply>` – Edits the reply associated with an existing word.
- `/deletebotreply <word>` – Removes a word + reply pair from the database.

### WoW / Blacklist
- `/addblacklist <raiderio>` – Adds a World of Warcraft character to the M+ blacklist using a Raider.IO URL.
- `/getblacklist` – Shows a formatted list of all characters in the M+ blacklist.
- `/wowtoken` – Displays the current WoW Token price in gold.

### Put.io Integration
- `/addtoputio <magnetlink>` – Adds a torrent magnet link to your Put.io account.

### Games
- `/rollphasmo` – Starts a Phasmophobia roulette that rolls random items using interactive buttons.

## Notes
- Most commands are implemented as Discord slash commands using `@discordjs/builders`.
- Some commands require specific bot permissions (managed via `/setbotpermission`).

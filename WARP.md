# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

GNDiscordBot is a Node.js Discord bot backed by MongoDB. The entrypoint is `index.js`, which wires up:
- Discord.js client and intents
- MongoDB connection via Mongoose
- Slash command handlers from `commands/`
- Event handlers from `events/`

Domain logic is split into:
- `commands/` – Slash commands (moderation utilities, spam move, WoW blacklist, Phasmophobia roulette, Put.io integration, etc.).
- `events/` – Discord event handlers for `ready`, `interactionCreate`, `messageCreate`, and `voiceStateUpdate`.
- `models/` – Mongoose models for bot settings, permissions, TTS word replies, WoW blacklist, default channels, and disconnect state.
- `config/` – Database bootstrap; `config.js` loads environment variables via `dotenv`.
- `helpers/` – External service helpers (e.g., Blizzard OAuth in `AuthHelpers.js`).
- `strings.js` – Centralized string constants for command names, messages, and permission names.

The README is minimal; this file is the main source of project-specific guidance.

## Environment & configuration

Configuration is provided via `.env`, loaded in `config.js`:
- Discord: `TOKEN`, `CLIENTID`, `GUILDID`, `NODE_ENV`
- MongoDB: `MONGO_URL`, `MONGO_USER`, `MONGO_PASS`, `MONGO_DB`
- Blizzard API: `BLIZZARD_TOKEN`
- Put.io: `PUTIO_CLIENT_ID`, `PUTIO_CLIENT_SECRET`, `PUTIO_CLIENT_OAUTH`, `PUTIO_USERNAME`, `PUTIO_PASSWORD`

`config/Database.js` uses `MONGO_*` values to connect to MongoDB at startup. The bot will not function without a reachable Mongo instance and valid credentials.

`NODE_ENV` controls how slash commands are registered in `events/ready.js`:
- `production`: commands are registered globally via `Routes.applicationCommands`.
- Any other value: commands are registered per guild via `Routes.applicationGuildCommands(clientId, GUILDID)`.

## Commands & scripts

### Install dependencies

Use npm (package manager is defined via `package.json`):

```bash
npm install
```

### Run the bot (development)

`package.json` exposes a single script using `nodemon`:

```bash
npm run start
```

This runs `nodemon .`, which resolves to `index.js`. It restarts the process on file changes and is the preferred way to develop.

To run once without auto-reload:

```bash
node .
```

There are currently no npm scripts defined for build, lint, or tests.

### Linting

ESLint is installed as a devDependency, but no script is configured. To lint the project from the repo root:

```bash
npx eslint .
```

Adjust the path (e.g., `npx eslint commands events models`) if you want to limit the lint scope.

### Tests

There is no test framework configured (no Jest/Mocha/etc. dependencies or scripts). To add tests in the future:
- Install and configure your preferred test runner.
- Add appropriate npm scripts (e.g., `test`, `test:unit`, `test:watch`).
- Update this WARP.md with how to run a single test once test tooling exists.

## High-level architecture

### Entrypoint and bootstrapping

- `index.js` creates a `discord.js` `Client` with `GUILDS`, `GUILD_MESSAGES`, and `GUILD_VOICE_STATES` intents.
- It instantiates `config/Database` and immediately calls `db.connect()` to connect to MongoDB.
- It dynamically loads every `.js` file under `commands/`, expecting each to export an object with:
  - `data`: a `SlashCommandBuilder` instance.
  - `execute(interaction)`: async handler.
- It pushes `command.data.toJSON()` for registration and stores commands in `client.commands` (a `Collection`).
- It then loads every `.js` file in `events/`, expecting an export of the form:
  - `name`: the Discord event name (e.g., `ready`, `interactionCreate`, `messageCreate`, `voiceStateUpdate`).
  - Optional `once`: if true, the handler is attached via `client.once`; otherwise via `client.on`.
  - `execute(...args, commands)`: event handler; for some events, the `commands` array is passed.
- Finally, it calls `client.login(config.TOKEN)`.

This pattern means that adding a new command or event is a matter of dropping an appropriately shaped module in the correct folder; no central registration list exists beyond directory scanning.

### Slash command lifecycle

1. On startup, `index.js` discovers all command modules in `commands/` and builds both:
   - A `commands` array for registration with Discord.
   - A `client.commands` map keyed by `command.data.name`.
2. When the bot becomes ready, `events/ready.js`:
   - Logs that the bot is ready.
   - Uses `@discordjs/rest` and `discord-api-types/v9` Routes to register slash commands.
   - Chooses global vs guild-scoped registration based on `NODE_ENV`.
3. When a user invokes a slash command, `events/interactionCreate.js`:
   - Filters to commands (`interaction.isCommand()`).
   - Resolves the command via `interaction.client.commands.get(interaction.commandName)`.
   - Executes `command.execute(interaction)`.
   - Catches errors and replies with a generic ephemeral error message.

### Events and side effects

- `events/messageCreate.js`
  - Implements a TTS auto-reply system driven by Mongo collections `BotSettings` and `WordReply`.
  - Ensures a `ttsEnabled` setting exists (creates it if missing).
  - When enabled, scans messages for configured trigger words and sends a combined TTS message to the channel if any are found.

- `events/voiceStateChange.js` (event name `voiceStateUpdate`)
  - Implements an “auto-disconnect punishments” system using `BotSettings`, `DiscordDefaultChannel`, `IgnoreDisconnect`, and `ShouldBeDisconnected`.
  - For recent `MEMBER_DISCONNECT` audit log entries, schedules and enforces timed disconnections of the executor.
  - Sends human-readable messages to a configured default text channel (`DiscordDefaultChannel`) and updates `ShouldBeDisconnected` records to control how long a user should be disconnected.
  - Also enforces ongoing disconnects for users with an active `ShouldBeDisconnected` record.

### Persistence layer

Models under `models/` are simple Mongoose schemas with `_id` (Number) and domain-specific fields. Key concepts:
- `BotSettings`: feature flags and configuration toggles (e.g., `ttsEnabled`, command enable/disable flags).
- `BotPermissions`: per-user permission bits for privileged commands (e.g., adding ignore entries, editing permissions).
- `DiscordDefaultChannel`: per-guild “home” channel where the bot posts specific messages.
- `IgnoreDisconnect`: users exempt from disconnect punishment.
- `ShouldBeDisconnected`: users who should be forcibly disconnected from voice until a given `until` timestamp.
- `Tokens`: generic store for external service tokens (e.g., Put.io tokens with expiry).
- `WordReply`: mappings from trigger words to reply messages for `messageCreate` TTS responses.
- `WowBlacklist`: WoW Mythic+ blacklist entries with IGN, realm, and metadata.

The database connection is centralized in `config/Database.js`. All command/event logic makes direct use of the exported models; there is no repository or service layer abstraction.

### Command structure and permissions

All commands in `commands/` follow the same pattern:
- Export an object with `data` (SlashCommandBuilder) and `execute(interaction)`.
- Use Discord-interaction options to pull arguments (`getUser`, `getString`, `getInteger`, `getChannel`).
- Interact with Mongo models directly.

Permission and settings patterns to be aware of:
- `strings.js` contains:
  - `commandName`: symbolic names for commands that have on/off toggles stored in `BotSettings`.
  - `messages`: shared human-readable messages for command replies (e.g., `permissionDenied`, `commandDisabled`).
  - `permissionNames`: symbolic names used in `BotPermissions`.
- Commands like `addIgnoreDisconnect`, `addToDisconnectList`, and `addbotpermission`:
  - Check `BotPermissions` using names from `strings.permissionNames`.
  - Either short-circuit with `messages.permissionDenied` or perform the requested action.

When adding new commands that need fine-grained permissions or feature flags, follow these conventions:
- Add a new entry to `strings.permissionNames` and/or `strings.commandName`.
- Store settings in `BotSettings` keyed by the new name.
- Use `BotPermissions` for per-user access control.

### External services

- Blizzard API
  - `helpers/AuthHelpers.js` provides `getBlizzardApiKey()`, which performs a client-credentials OAuth flow using `BLIZZARD_TOKEN` (basic auth) and returns an access token.
- Put.io
  - `commands/addToPutio.js` integrates with Put.io via `@putdotio/api-client`.
  - It fetches or refreshes an OAuth token stored in `Tokens` and uses it to add a new transfer from a provided magnet link.

### Adding new functionality

To add a new slash command:
1. Create a new file under `commands/` (e.g., `commands/foo.js`).
2. Export `{ data: new SlashCommandBuilder().setName('foo')..., async execute(interaction) { ... } }`.
3. Use existing commands (`ping`, `echo`, `addbotreply`, etc.) as structural references.
4. Restart the bot so `index.js` can load the new command and `events/ready.js` can register it.

To add a new event handler:
1. Create a file under `events/` exporting `{ name, once?, async execute(...) { ... } }`.
2. Ensure `name` matches a Discord.js client event.
3. Restart the bot to attach the new handler.

## Notes for future Warp agents

- This project currently lacks detailed documentation and automated tests; rely heavily on the code structure itself when making changes.
- Be careful editing schemas in `models/`; changes affect MongoDB collections that may already contain data.
- When modifying command behavior, keep the centralized strings in `strings.js` up-to-date so messages and permission names stay consistent.
- If you introduce new npm scripts for linting/testing, update this WARP.md so agents know the canonical commands to run.

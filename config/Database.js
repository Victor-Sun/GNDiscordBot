const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS BotSettings (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    value INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS DiscordDefaultChannel (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId TEXT NOT NULL,
    discordId TEXT NOT NULL,
    UNIQUE(discordId)
  );

  CREATE TABLE IF NOT EXISTS IgnoreDisconnect (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    UNIQUE(userId)
  );

  CREATE TABLE IF NOT EXISTS ShouldBeDisconnected (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    until INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS WordReply (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    reply TEXT NOT NULL,
    added_by_username TEXT,
    added_by_id TEXT
  );

  CREATE TABLE IF NOT EXISTS WowBlacklist (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    ign TEXT NOT NULL,
    realm TEXT NOT NULL,
    added_by_username TEXT,
    added_by_id TEXT,
    reason TEXT
  );

  CREATE TABLE IF NOT EXISTS Tokens (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    service TEXT NOT NULL,
    until INTEGER
  );

  CREATE TABLE IF NOT EXISTS BotPermissions (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    userId TEXT NOT NULL,
    value INTEGER NOT NULL
  );
`);

module.exports = db;

const mysql = require('mysql2/promise');
const config = require('../config');

// Create connection pool
const pool = mysql.createPool({
  host: config.MARIADB_HOST,
  port: config.MARIADB_PORT,
  user: config.MARIADB_USER,
  password: config.MARIADB_PASSWORD,
  database: config.MARIADB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS BotSettings (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        value INT NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS DiscordDefaultChannel (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        channelId VARCHAR(255) NOT NULL,
        discordId VARCHAR(255) NOT NULL,
        UNIQUE(discordId)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS IgnoreDisconnect (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        UNIQUE(userId)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ShouldBeDisconnected (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        guildId VARCHAR(255) NOT NULL,
        until INT NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS WordReply (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        reply TEXT NOT NULL,
        added_by_username VARCHAR(255),
        added_by_id VARCHAR(255)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS WowBlacklist (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        ign VARCHAR(255) NOT NULL,
        realm VARCHAR(255) NOT NULL,
        added_by_username VARCHAR(255),
        added_by_id VARCHAR(255),
        reason TEXT
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Tokens (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        token TEXT NOT NULL,
        service VARCHAR(255) NOT NULL,
        until INT
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS BotPermissions (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        userId VARCHAR(255) NOT NULL,
        value INT NOT NULL
      );
    `);
  } finally {
    connection.release();
  }
}

// Initialize on module load
initializeDatabase().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});

module.exports = pool;

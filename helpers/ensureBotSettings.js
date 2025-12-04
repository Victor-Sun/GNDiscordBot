const BotSettings = require('../models/BotSettings');
const { commandName } = require('../strings');

// Ensure that all expected BotSettings rows exist for command gating.
// This runs on startup so individual commands don't need to lazily create settings.
async function ensureBotSettings() {
  const defaultSettings = Object.values(commandName).map((name) => ({
    name,
    value: true, // Commands are enabled by default; can be changed via /setcommandsetting
  }));

  for (const setting of defaultSettings) {
    try {
      const existing = await BotSettings.findOne({ name: setting.name });
      if (!existing) {
        await BotSettings.insertMany(setting);
      }
    } catch (err) {
      console.error(`Failed to ensure BotSettings entry for ${setting.name}:`, err);
    }
  }
}

module.exports = ensureBotSettings;

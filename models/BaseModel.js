const db = require('../config/Database');

function buildWhere(filter) {
  if (!filter || Object.keys(filter).length === 0) {
    return { where: '', params: [] };
  }

  const conditions = [];
  const params = [];

  for (const [key, value] of Object.entries(filter)) {
    conditions.push(`${key} = ?`);
    params.push(value);
  }

  return {
    where: `WHERE ${conditions.join(' AND ')}`,
    params,
  };
}

function createModel(tableName) {
  return {
    async findOne(filter = {}) {
      const { where, params } = buildWhere(filter);
      const stmt = db.prepare(`SELECT * FROM ${tableName} ${where} LIMIT 1`);
      const row = stmt.get(...params);
      return row || null;
    },

    async find(filter = {}) {
      const { where, params } = buildWhere(filter);
      const stmt = db.prepare(`SELECT * FROM ${tableName} ${where}`);
      return stmt.all(...params);
    },

    async insertMany(docs) {
      const rows = Array.isArray(docs) ? docs : [docs];
      if (rows.length === 0) return;

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const stmt = db.prepare(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);

      const insert = db.transaction((items) => {
        for (const item of items) {
          const values = columns.map((c) => {
            const value = item[c];
            if (typeof value === 'boolean') {
              return value ? 1 : 0;
            }
            return value;
          });
          console.log(stmt)
          stmt.run(values);
        }
      });

      insert(rows);
    },

    async updateOne(filter, update) {
      if (!update || Object.keys(update).length === 0) return { changes: 0 };

      const setColumns = Object.keys(update);
      const setClause = setColumns.map((c) => `${c} = ?`).join(', ');
      const { where, params } = buildWhere(filter || {});
      const stmt = db.prepare(`UPDATE ${tableName} SET ${setClause} ${where}`);

      // Coerce booleans to integers so better-sqlite3 can bind them.
      const setValues = setColumns.map((c) => {
        const value = update[c];
        if (typeof value === 'boolean') {
          return value ? 1 : 0;
        }
        return value;
      });

      const allParams = [...setValues, ...params];
      const result = stmt.run(...allParams);
      return result;
    },

    async deleteOne(filter) {
      const { where, params } = buildWhere(filter || {});
      const stmt = db.prepare(`DELETE FROM ${tableName} ${where}`);
      const result = stmt.run(...params);
      return result;
    },

    async deleteMany(filter) {
      const { where, params } = buildWhere(filter || {});
      const stmt = db.prepare(`DELETE FROM ${tableName} ${where}`);
      const result = stmt.run(...params);
      return result;
    },

    async findOneAndDelete(filter) {
      const existing = await this.findOne(filter);
      if (!existing) return null;
      await this.deleteOne(filter);
      return existing;
    },
  };
}

module.exports = { createModel };
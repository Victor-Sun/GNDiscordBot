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
      const [rows] = await db.execute(`SELECT * FROM ${tableName} ${where} LIMIT 1`, params);
      return rows[0] || null;
    },

    async find(filter = {}) {
      const { where, params } = buildWhere(filter);
      const [rows] = await db.execute(`SELECT * FROM ${tableName} ${where}`, params);
      return rows;
    },

    async insertMany(docs) {
      const rows = Array.isArray(docs) ? docs : [docs];
      if (rows.length === 0) return;

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

      // Use a transaction for multiple inserts
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        
        for (const item of rows) {
          const values = columns.map((c) => {
            const value = item[c];
            if (typeof value === 'boolean') {
              return value ? 1 : 0;
            }
            return value;
          });
          await connection.execute(query, values);
        }
        
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },

    async updateOne(filter, update) {
      if (!update || Object.keys(update).length === 0) return { affectedRows: 0 };

      const setColumns = Object.keys(update);
      const setClause = setColumns.map((c) => `${c} = ?`).join(', ');
      const { where, params } = buildWhere(filter || {});

      // Coerce booleans to integers
      const setValues = setColumns.map((c) => {
        const value = update[c];
        if (typeof value === 'boolean') {
          return value ? 1 : 0;
        }
        return value;
      });

      const allParams = [...setValues, ...params];
      const [result] = await db.execute(`UPDATE ${tableName} SET ${setClause} ${where}`, allParams);
      return result;
    },

    async deleteOne(filter) {
      const { where, params } = buildWhere(filter || {});
      const [result] = await db.execute(`DELETE FROM ${tableName} ${where}`, params);
      return result;
    },

    async deleteMany(filter) {
      const { where, params } = buildWhere(filter || {});
      const [result] = await db.execute(`DELETE FROM ${tableName} ${where}`, params);
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
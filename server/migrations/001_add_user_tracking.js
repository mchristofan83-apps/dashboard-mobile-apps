
// Sample Migration: Add user tracking
const database = require('../config/database-enhanced');

module.exports = {
  async up() {
    // Add user tracking table
    const sql = `
      CREATE TABLE IF NOT EXISTS user_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES menulogin(id)
      )
    `;
    await database.run(sql);
  },

  async down() {
    await database.run('DROP TABLE IF EXISTS user_tracking');
  }
};

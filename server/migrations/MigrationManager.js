
// Database Migration System
const fs = require('fs');
const path = require('path');
const database = require('../config/database-enhanced');

class MigrationManager {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.migrationsTable = 'migrations';
  }

  async initialize() {
    await database.connect();
    await this.createMigrationsTable();
  }

  async createMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await database.run(sql);
  }

  async runMigrations() {
    const migrationFiles = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.js');
      
      if (!(await this.isMigrationExecuted(migrationName))) {
        await this.runMigration(migrationName, file);
      }
    }
  }

  async isMigrationExecuted(name) {
    const result = await database.get(
      'SELECT name FROM migrations WHERE name = ?',
      [name]
    );
    return !!result;
  }

  async runMigration(name, file) {
    console.log(`🔄 Running migration: ${name}`);
    
    try {
      const migration = require(path.join(this.migrationsPath, file));
      
      if (typeof migration.up === 'function') {
        await migration.up();
      }
      
      await database.run(
        'INSERT INTO migrations (name) VALUES (?)',
        [name]
      );
      
      console.log(`✅ Migration completed: ${name}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${name}`, error.message);
      throw error;
    }
  }

  async rollbackMigration(name) {
    console.log(`⏪ Rolling back migration: ${name}`);
    
    try {
      const migration = require(path.join(this.migrationsPath, `${name}.js`));
      
      if (typeof migration.down === 'function') {
        await migration.down();
      }
      
      await database.run(
        'DELETE FROM migrations WHERE name = ?',
        [name]
      );
      
      console.log(`✅ Migration rolled back: ${name}`);
    } catch (error) {
      console.error(`❌ Migration rollback failed: ${name}`, error.message);
      throw error;
    }
  }
}

module.exports = MigrationManager;

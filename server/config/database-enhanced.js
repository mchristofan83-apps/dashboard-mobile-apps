
// Enhanced Database Configuration
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseConnection {
  constructor() {
    this.db = null;
    this.environment = process.env.NODE_ENV || 'development';
    this.config = require('./database.json')[this.environment];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.resolve(this.config.filename);
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.db = new sqlite3.Database(dbPath, this.config.options, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Database connected successfully');
          this.setupDatabase();
          resolve(this.db);
        }
      });
    });
  }

  async setupDatabase() {
    // Enable foreign keys
    await this.run('PRAGMA foreign_keys = ON');
    
    // Set up WAL mode for better concurrency
    await this.run('PRAGMA journal_mode = WAL');
    
    // Optimize for production
    if (this.environment === 'production') {
      await this.run('PRAGMA synchronous = NORMAL');
      await this.run('PRAGMA cache_size = 10000');
      await this.run('PRAGMA temp_store = MEMORY');
    }
    
    // Create tables
    await this.createTables();
  }

  async createTables() {
    const schema = require('../database/schema');
    
    for (const [tableName, query] of Object.entries(schema)) {
      try {
        await this.run(query);
        console.log(`✅ Table created/verified: ${tableName}`);
      } catch (error) {
        console.error(`❌ Error creating table ${tableName}:`, error.message);
      }
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            console.log('✅ Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Create singleton instance
const database = new DatabaseConnection();

module.exports = database;

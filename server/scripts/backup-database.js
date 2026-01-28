
#!/usr/bin/env node

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseBackup {
  async backup() {
    const dbPath = './database/production.db';
    const backupDir = './backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy database
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Database backed up to: ${backupPath}`);
    
    // Keep only last 7 backups
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backups.length > 7) {
      const toDelete = backups.slice(7);
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️  Deleted old backup: ${file}`);
      });
    }
  }
}

new DatabaseBackup().backup();

/**
 * Database Backup Script
 * 
 * This script creates backups of the SQLite database file and manages backup retention.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const winston = require('winston');

// Configuration
const CONFIG = {
  dbPath: path.join(__dirname, '../data/licenses.db'),
  backupDir: path.join(__dirname, '../backup'),
  logDir: path.join(__dirname, '../logs'),
  maxBackups: 10, // Maximum number of backups to keep
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Ensure directories exist
[CONFIG.backupDir, CONFIG.logDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(CONFIG.logDir, 'backup-error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(CONFIG.logDir, 'backup.log')
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Creates a backup of the database
 */
async function createBackup() {
  try {
    // Check if database file exists
    if (!fs.existsSync(CONFIG.dbPath)) {
      throw new Error(`Database file not found: ${CONFIG.dbPath}`);
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `licenses-backup-${timestamp}.db`;
    const backupPath = path.join(CONFIG.backupDir, backupFilename);

    // Copy the database file
    fs.copyFileSync(CONFIG.dbPath, backupPath);
    
    logger.info(`Backup created: ${backupFilename}`);
    
    // Check if backup is valid by opening it
    const db = new sqlite3.Database(backupPath, sqlite3.OPEN_READONLY);
    db.get('SELECT count(*) as count FROM licenses', (err, row) => {
      if (err) {
        logger.error(`Backup validation failed: ${err.message}`);
      } else {
        logger.info(`Backup validated: ${row.count} licenses`);
      }
      db.close();
    });

    // Rotate old backups
    rotateBackups();
    
    return backupPath;
  } catch (error) {
    logger.error(`Backup failed: ${error.message}`, { stack: error.stack });
    throw error;
  }
}

/**
 * Rotates backups, keeping only the most recent ones
 */
function rotateBackups() {
  try {
    const backupFiles = fs.readdirSync(CONFIG.backupDir)
      .filter(file => file.startsWith('licenses-backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(CONFIG.backupDir, file),
        time: fs.statSync(path.join(CONFIG.backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by time descending (newest first)
    
    // If we have more backups than the maximum, delete the oldest ones
    if (backupFiles.length > CONFIG.maxBackups) {
      const filesToDelete = backupFiles.slice(CONFIG.maxBackups);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        logger.info(`Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    logger.error(`Error rotating backups: ${error.message}`, { stack: error.stack });
  }
}

/**
 * Restores a database from backup
 * @param {string} backupPath - Path to the backup file
 */
async function restoreFromBackup(backupPath) {
  try {
    // Validate backup path
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    // Generate a backup of the current database before restoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackup = path.join(CONFIG.backupDir, `pre-restore-${timestamp}.db`);
    
    // Backup current DB if it exists
    if (fs.existsSync(CONFIG.dbPath)) {
      fs.copyFileSync(CONFIG.dbPath, preRestoreBackup);
      logger.info(`Created pre-restore backup: ${path.basename(preRestoreBackup)}`);
    }
    
    // Copy the backup file to the database location
    fs.copyFileSync(backupPath, CONFIG.dbPath);
    logger.info(`Restored database from backup: ${path.basename(backupPath)}`);
    
    return true;
  } catch (error) {
    logger.error(`Restore failed: ${error.message}`, { stack: error.stack });
    throw error;
  }
}

/**
 * Lists all available backups
 * @returns {Array} List of backup files with metadata
 */
function listBackups() {
  try {
    const backupFiles = fs.readdirSync(CONFIG.backupDir)
      .filter(file => file.startsWith('licenses-backup-') && file.endsWith('.db'))
      .map(file => {
        const stats = fs.statSync(path.join(CONFIG.backupDir, file));
        return {
          name: file,
          path: path.join(CONFIG.backupDir, file),
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime()); // Newest first
    
    return backupFiles;
  } catch (error) {
    logger.error(`Error listing backups: ${error.message}`, { stack: error.stack });
    return [];
  }
}

/**
 * Scheduled backup function
 */
function scheduleBackups() {
  // Perform initial backup
  createBackup()
    .then(() => logger.info('Initial backup completed'))
    .catch(err => logger.error('Initial backup failed', { error: err.message }));
  
  // Schedule regular backups
  setInterval(() => {
    createBackup()
      .then(() => logger.info('Scheduled backup completed'))
      .catch(err => logger.error('Scheduled backup failed', { error: err.message }));
  }, CONFIG.backupInterval);
}

// If this script is run directly, create a backup
if (require.main === module) {
  createBackup()
    .then(backupPath => {
      console.log(`Backup created: ${path.basename(backupPath)}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`Backup failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  createBackup,
  restoreFromBackup,
  listBackups,
  scheduleBackups,
  CONFIG
}; 
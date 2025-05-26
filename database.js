const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Database path
const dbPath = path.join(dataDir, 'licenses.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

/**
 * Initialize the database with required tables
 */
function setupDatabase() {
  db.serialize(() => {
    // Create licenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT UNIQUE NOT NULL,
        user_id TEXT,
        user_name TEXT,
        email TEXT,
        language TEXT NOT NULL,
        issue_date INTEGER NOT NULL,
        expiration_date INTEGER,
        is_active INTEGER DEFAULT 1,
        metadata TEXT
      )
    `);

    // Create usage logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_id INTEGER,
        action TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        details TEXT,
        FOREIGN KEY (license_id) REFERENCES licenses (id)
      )
    `);

    console.log('Database initialized successfully');
  });
}

/**
 * Add a new license to the database
 */
function addLicense(licenseData) {
  return new Promise((resolve, reject) => {
    const {
      license_key,
      user_id,
      user_name,
      email,
      language,
      issue_date,
      expiration_date,
      metadata
    } = licenseData;
    
    const stmt = db.prepare(`
      INSERT INTO licenses 
      (license_key, user_id, user_name, email, language, issue_date, expiration_date, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      license_key,
      user_id || null,
      user_name || null,
      email || null,
      language,
      issue_date,
      expiration_date || null,
      metadata ? JSON.stringify(metadata) : null,
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Log the action
          logAction(this.lastID, 'CREATE', 'License created');
          resolve(this.lastID);
        }
      }
    );
    
    stmt.finalize();
  });
}

/**
 * Get a license by its key
 */
function getLicenseByKey(licenseKey) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM licenses WHERE license_key = ?',
      [licenseKey],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

/**
 * Get licenses by user ID
 */
function getLicensesByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM licenses WHERE user_id = ?',
      [userId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

/**
 * Update a license's status
 */
function updateLicenseStatus(licenseId, isActive) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE licenses SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, licenseId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Log the action
          const action = isActive ? 'ACTIVATE' : 'DEACTIVATE';
          logAction(licenseId, action, `License ${action.toLowerCase()}d`);
          resolve(this.changes);
        }
      }
    );
  });
}

/**
 * Update a license's user
 */
function assignLicense(licenseId, userId, userName) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE licenses SET user_id = ?, user_name = ? WHERE id = ?',
      [userId, userName, licenseId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Log the action
          logAction(licenseId, 'ASSIGN', `Assigned to ${userName} (${userId})`);
          resolve(this.changes);
        }
      }
    );
  });
}

/**
 * Delete a license
 */
function deleteLicense(licenseId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM licenses WHERE id = ?',
      [licenseId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Log the action
          logAction(licenseId, 'DELETE', 'License deleted');
          resolve(this.changes);
        }
      }
    );
  });
}

/**
 * Log an action for a license
 */
function logAction(licenseId, action, details) {
  const timestamp = Math.floor(Date.now() / 1000);
  db.run(
    'INSERT INTO usage_logs (license_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
    [licenseId, action, timestamp, details]
  );
}

/**
 * Get license usage logs
 */
function getLicenseLogs(licenseId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM usage_logs WHERE license_id = ? ORDER BY timestamp DESC',
      [licenseId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

/**
 * Generate a random license key
 */
function generateLicenseKey(prefix = '') {
  const randomPart = Math.random().toString(36).substring(2, 15) +
                   Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  
  // Format as XXXX-XXXX-XXXX-XXXX
  const combined = `${prefix}${randomPart}${timestamp}`.toUpperCase();
  let formatted = '';
  for (let i = 0; i < combined.length && formatted.length < 19; i++) {
    if (formatted.length > 0 && formatted.length % 5 === 0) {
      formatted += '-';
    }
    formatted += combined[i];
  }
  
  return formatted.substring(0, 19);
}

// Export functions
module.exports = {
  setupDatabase,
  addLicense,
  getLicenseByKey,
  getLicensesByUser,
  updateLicenseStatus,
  assignLicense,
  deleteLicense,
  getLicenseLogs,
  generateLicenseKey
}; 
/**
 * Backup and Restore Tests
 * Tests the database backup and restore functionality
 */

const fs = require('fs');
const path = require('path');
const { 
  createBackup, 
  restoreFromBackup, 
  listBackups, 
  CONFIG 
} = require('../backup/backup');

// Mock fs module
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    copyFileSync: jest.fn(),
    existsSync: jest.fn(),
    readdirSync: jest.fn(),
    statSync: jest.fn(),
    unlinkSync: jest.fn(),
    mkdirSync: jest.fn()
  };
});

// Mock path module
jest.mock('path', () => {
  const originalPath = jest.requireActual('path');
  return {
    ...originalPath,
    join: jest.fn((...args) => args.join('/'))
  };
});

// Mock sqlite3
jest.mock('sqlite3', () => {
  // Create mock database
  const mockDb = {
    get: jest.fn((query, callback) => {
      callback(null, { count: 42 });
    }),
    close: jest.fn()
  };
  
  return {
    verbose: () => ({
      Database: jest.fn(() => mockDb)
    })
  };
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Setup default mock behavior
  fs.existsSync.mockImplementation(path => {
    // Database file exists
    if (path === CONFIG.dbPath) return true;
    // Backup directory exists
    if (path === CONFIG.backupDir) return true;
    // Mock backup file exists
    if (path.includes('backup')) return true;
    return false;
  });
  
  fs.readdirSync.mockReturnValue([
    'licenses-backup-2023-05-20T12-00-00-000Z.db',
    'licenses-backup-2023-05-21T12-00-00-000Z.db',
    'licenses-backup-2023-05-22T12-00-00-000Z.db'
  ]);
  
  fs.statSync.mockImplementation(path => {
    const match = path.match(/licenses-backup-(\d{4}-\d{2}-\d{2})T/);
    if (match) {
      const date = new Date(match[1]);
      return {
        size: 1024 * 1024, // 1MB
        mtime: date
      };
    }
    return {
      size: 0,
      mtime: new Date()
    };
  });
});

describe('Backup Functionality', () => {
  test('should create a backup of the database', async () => {
    // Execute backup
    const backupPath = await createBackup();
    
    // Check that the file was copied
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      CONFIG.dbPath,
      expect.stringContaining('licenses-backup-')
    );
    
    // Check that the returned path is correct
    expect(backupPath).toContain('licenses-backup-');
  });
  
  test('should fail if database file does not exist', async () => {
    // Setup mock to make database file not exist
    fs.existsSync.mockImplementation(path => {
      if (path === CONFIG.dbPath) return false;
      return true;
    });
    
    // Attempt backup and expect it to fail
    await expect(createBackup()).rejects.toThrow('Database file not found');
  });
  
  test('should list available backups', () => {
    // Get list of backups
    const backups = listBackups();
    
    // Check that correct methods were called
    expect(fs.readdirSync).toHaveBeenCalledWith(CONFIG.backupDir);
    
    // Check backup list structure
    expect(backups).toHaveLength(3);
    expect(backups[0]).toHaveProperty('name');
    expect(backups[0]).toHaveProperty('path');
    expect(backups[0]).toHaveProperty('size');
    expect(backups[0]).toHaveProperty('created');
    
    // Check sorting (newest first)
    expect(backups[0].name).toBe('licenses-backup-2023-05-22T12-00-00-000Z.db');
  });
});

describe('Restore Functionality', () => {
  test('should restore database from backup', async () => {
    // Define backup path
    const backupPath = 'backup/licenses-backup-2023-05-22T12-00-00-000Z.db';
    
    // Execute restore
    const result = await restoreFromBackup(backupPath);
    
    // Check that a pre-restore backup was created
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      CONFIG.dbPath,
      expect.stringContaining('pre-restore-')
    );
    
    // Check that the backup was copied to the database location
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      backupPath,
      CONFIG.dbPath
    );
    
    // Check result
    expect(result).toBe(true);
  });
  
  test('should fail if backup file does not exist', async () => {
    // Setup mock to make backup file not exist
    fs.existsSync.mockImplementation(path => {
      if (path.includes('missing-backup')) return false;
      return true;
    });
    
    // Attempt restore with non-existent backup
    await expect(restoreFromBackup('missing-backup.db'))
      .rejects.toThrow('Backup file not found');
  });
});

describe('Backup Rotation', () => {
  test('should rotate backups when there are too many', async () => {
    // Create many backup files
    const manyBackups = Array.from({ length: 15 }, (_, i) => 
      `licenses-backup-2023-05-${10 + i}T12-00-00-000Z.db`
    );
    
    // Setup mock to return many backups
    fs.readdirSync.mockReturnValue(manyBackups);
    
    // Execute backup which should trigger rotation
    await createBackup();
    
    // Check that some backups were deleted
    expect(fs.unlinkSync).toHaveBeenCalled();
    
    // Count number of deletions (should delete 15 - CONFIG.maxBackups + 1 new backup)
    const deletionCount = fs.unlinkSync.mock.calls.length;
    expect(deletionCount).toBe(15 - CONFIG.maxBackups + 1);
  });
}); 
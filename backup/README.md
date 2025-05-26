# Database Backup System

This folder contains scripts for managing database backups for the Discord License Manager Bot.

## Features

- Automated backup of the SQLite database
- Backup rotation (keeps the most recent backups)
- Database restore functionality
- Backup validation
- Logging of backup operations

## Files

- `backup.js` - The main backup script with backup and restore functionality

## Usage

### Creating a Manual Backup

To create a backup manually, run:

```bash
node backup/backup.js
```

This will create a backup file in the `backup` directory with a timestamp in the filename.

### Scheduling Automated Backups

To enable automated backups, add the following code to your main application:

```javascript
const { scheduleBackups } = require('./backup/backup');

// Start automated backups
scheduleBackups();
```

By default, this will create backups every 24 hours and keep the 10 most recent backups.

### Restoring from a Backup

To restore from a backup, you can use the provided API:

```javascript
const { restoreFromBackup, listBackups } = require('./backup/backup');

// List available backups
const backups = listBackups();
console.log('Available backups:', backups);

// Restore from a specific backup
if (backups.length > 0) {
  restoreFromBackup(backups[0].path)
    .then(() => console.log('Restore completed successfully'))
    .catch(err => console.error('Restore failed:', err.message));
}
```

### Configuration

The backup system configuration is defined in the `backup.js` file:

```javascript
const CONFIG = {
  dbPath: path.join(__dirname, '../data/licenses.db'),
  backupDir: path.join(__dirname, '../backup'),
  logDir: path.join(__dirname, '../logs'),
  maxBackups: 10, // Maximum number of backups to keep
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};
```

You can modify these settings to customize the backup behavior.

## Backup File Format

Backup files are direct copies of the SQLite database file with a timestamp in the filename:

```
licenses-backup-2023-05-26T12-34-56-789Z.db
```

## Logs

Backup operations are logged to:

- `logs/backup.log` - All backup operations
- `logs/backup-error.log` - Error messages only

## Security Considerations

- Backup files contain sensitive license information and should be protected
- Consider encrypting backup files for additional security
- Store backups in a secure location, ideally on a different physical device

## Disaster Recovery

In case of database corruption:

1. Stop the Discord bot and API server
2. Run `node backup/restore.js [backup-file-path]`
3. Restart the Discord bot and API server

If no backup file is specified, the most recent backup will be used automatically.

## Integration with Discord Bot

To add a backup command to your Discord bot, add the following to your command handlers:

```javascript
if (command === 'backup') {
  if (!isAdmin(message.author.id)) {
    return message.reply('You do not have permission to use this command.');
  }
  
  const { createBackup, listBackups } = require('./backup/backup');
  
  try {
    const backupPath = await createBackup();
    const backups = listBackups();
    
    return message.reply(`Backup created successfully. You have ${backups.length} backups available.`);
  } catch (error) {
    return message.reply(`Failed to create backup: ${error.message}`);
  }
}
``` 
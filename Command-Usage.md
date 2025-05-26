# 💬 Command Usage

This guide covers all available commands in the Discord License Manager Bot.

## Basic Commands

### Help Command

View all available commands and their descriptions:

```
/help [command]
```

Parameters:
- `command` (optional): Specific command to get detailed help for

Examples:
```
/help
/help create
```

## License Management

### Create License

Create a new license with specified parameters:

```
/create game:<game> duration:<duration> [email:<email>]
```

Parameters:
- `game`: The game to create a license for (e.g., fortnite, fivem, gtav)
- `duration`: The license duration (e.g., day_1, month_1, lifetime)
- `email` (optional): Associated email address

Examples:
```
/create game:fortnite duration:month_1
/create game:fivem duration:month_3 email:user@example.com
```

### Verify License

Check if a license is valid and view its details:

```
/verify key:<license_key>
```

Parameters:
- `key`: The license key to verify

Example:
```
/verify key:F-ABCD-1234-EFGH
```

### Assign License

Assign a license to a Discord user:

```
/assign key:<license_key> user:<@user>
```

Parameters:
- `key`: The license key to assign
- `user`: The Discord user to assign the license to

Example:
```
/assign key:F-ABCD-1234-EFGH user:@JohnDoe
```

### Revoke License

Revoke a license from a user:

```
/revoke key:<license_key>
```

Parameters:
- `key`: The license key to revoke

Example:
```
/revoke key:F-ABCD-1234-EFGH
```

### Delete License

Permanently delete a license from the database:

```
/delete key:<license_key>
```

Parameters:
- `key`: The license key to delete

Example:
```
/delete key:F-ABCD-1234-EFGH
```

### List Licenses

List all licenses for a specific user or game:

```
/list [user:<@user>] [game:<game>]
```

Parameters:
- `user` (optional): Discord user to list licenses for
- `game` (optional): Game to list licenses for

Examples:
```
/list
/list user:@JohnDoe
/list game:fortnite
/list user:@JohnDoe game:fortnite
```

### Redeem License

Allow users to redeem a license key to their account:

```
/redeem key:<license_key>
```

Parameters:
- `key`: The license key to redeem

Example:
```
/redeem key:F-ABCD-1234-EFGH
```

## Advanced Features

### Bulk License Generation

Generate multiple licenses at once:

```
/bulk game:<game> duration:<duration> count:<number> [prefix:<prefix>] [email:<domain>]
```

Parameters:
- `game`: The game to create licenses for
- `duration`: The license duration
- `count`: Number of licenses to generate (max: 50)
- `prefix` (optional): Custom prefix to add to the generated keys
- `email` (optional): Email domain for these licenses

Examples:
```
/bulk game:fivem duration:month_3 count:10
/bulk game:fortnite duration:month_1 count:5 prefix:SPECIAL email:company.com
```

### License Renewal

Renew or extend an existing license:

```
/renew key:<license_key> duration:<duration> [extend:<true|false>]
```

Parameters:
- `key`: The license key to renew
- `duration`: The new duration to add
- `extend` (optional): If true, adds time to existing expiration; if false, sets new expiration from current date

Examples:
```
/renew key:F-ABCD-1234-EFGH duration:month_1
/renew key:F-ABCD-1234-EFGH duration:month_3 extend:true
```

### Configuration Management

View and modify bot configuration:

```
/config <action> [parameters...]
```

Actions:
- `view`: Show current configuration
- `set`: Update a configuration value
- `add`: Add an item to a configuration list
- `remove`: Remove an item from a configuration list

Examples:
```
/config view
/config set admin @AdminUser
/config add game name:minecraft prefix:MC display:Minecraft
```

See [Configuration](Configuration) for more details.

### Statistics

View license statistics and analytics:

```
/stats [game:<game>] [period:<period>]
```

Parameters:
- `game` (optional): Filter statistics by game
- `period` (optional): Time period for statistics (daily, weekly, monthly, all)

Examples:
```
/stats
/stats game:fortnite
/stats period:monthly
```

## Admin Commands

### Database Backup

Create a backup of the license database:

```
/backup [filename:<filename>]
```

Parameters:
- `filename` (optional): Custom name for the backup file

Example:
```
/backup
/backup filename:pre_update_backup
```

### Restore Backup

Restore the database from a backup:

```
/restore filename:<filename>
```

Parameters:
- `filename`: Name of the backup file to restore

Example:
```
/restore filename:backup_2023-01-01
```

### Bot Status

Check the status of the bot and its services:

```
/status
```

## Permission Levels

Commands have different permission requirements:

- **User Commands**: Anyone can use (help, verify, redeem, list)
- **Mod Commands**: Require specific roles (assign, revoke)
- **Admin Commands**: Limited to bot administrators (create, delete, bulk, config)

Permissions are configured in the bot's configuration. See [Configuration](Configuration) for details. 
# ⚙️ Configuration

This page explains how to configure your Discord License Manager Bot to suit your specific needs.

## Configuration File

The bot's main configuration is stored in `config.json` in the root directory. This file is created automatically during the initial setup, but you can edit it manually or use the bot's commands to update it.

### Default Configuration

```json
{
  "prefix": "!",
  "adminUsers": ["your_discord_id"],
  "adminRoles": [],
  "allowedChannels": [],
  "games": {
    "fortnite": {
      "prefix": "F",
      "displayName": "Fortnite"
    },
    "fivem": {
      "prefix": "FM",
      "displayName": "FiveM"
    },
    "gtav": {
      "prefix": "GTA",
      "displayName": "GTA V"
    },
    "cs2": {
      "prefix": "CS2",
      "displayName": "Counter-Strike 2"
    }
  },
  "durations": {
    "day_1": {
      "days": 1,
      "displayName": "1 Day"
    },
    "day_3": {
      "days": 3,
      "displayName": "3 Days"
    },
    "day_7": {
      "days": 7,
      "displayName": "7 Days"
    },
    "month_1": {
      "days": 30,
      "displayName": "1 Month"
    },
    "month_3": {
      "days": 90,
      "displayName": "3 Months"
    },
    "month_6": {
      "days": 180,
      "displayName": "6 Months"
    },
    "month_9": {
      "days": 270,
      "displayName": "9 Months"
    },
    "month_13": {
      "days": 390,
      "displayName": "13 Months"
    },
    "lifetime": {
      "days": 36500,
      "displayName": "Lifetime"
    }
  },
  "licenseKeyFormat": "XXXX-XXXX-XXXX",
  "apiRateLimit": 100,
  "apiRateLimitWindow": 15
}
```

## Configuration Options

### Basic Settings

- `prefix`: Command prefix for legacy text commands (not needed for slash commands)
- `adminUsers`: Array of Discord user IDs with administrative privileges
- `adminRoles`: Array of Discord role IDs with administrative privileges
- `allowedChannels`: Array of channel IDs where the bot can be used (empty means all channels)

### Game Configuration

The `games` object contains settings for each supported game:

- `prefix`: The prefix used for license keys (e.g., "F" for Fortnite makes keys like "F-XXXX-XXXX-XXXX")
- `displayName`: The human-readable name shown in commands and responses

### Duration Configuration

The `durations` object defines available license durations:

- `days`: Number of days the license is valid
- `displayName`: Human-readable name shown in commands and responses

### Advanced Settings

- `licenseKeyFormat`: Format for the random part of license keys (X will be replaced with random characters)
- `apiRateLimit`: Maximum number of API requests per window
- `apiRateLimitWindow`: Time window in minutes for rate limiting

## Using the Configuration Command

The bot provides a `/config` command for administrators to modify configuration without editing files directly.

### View Current Configuration

```
/config view
```

### Update Admin Users

```
/config set admin @user
/config remove admin @user
```

### Update Admin Roles

```
/config set adminrole @role
/config remove adminrole @role
```

### Update Allowed Channels

```
/config set channel #channel
/config remove channel #channel
```

### Update Game Settings

```
/config add game name:minecraft prefix:MC display:Minecraft
/config remove game name:minecraft
```

### Update Duration Settings

```
/config add duration id:month_12 days:365 display:"12 Months"
/config remove duration id:month_12
```

## Environment Variables

For sensitive information and deployment-specific settings, use the `.env` file:

```
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_server_id
API_PORT=3000
DASHBOARD_PORT=3001
DASHBOARD_TOKEN=your_dashboard_access_token
DATABASE_PATH=./data/licenses.db
LOG_LEVEL=info
```

## Reloading Configuration

After making changes to the configuration file manually, restart the bot to apply the changes:

```bash
pm2 restart license-bot
```

If using the `/config` command, changes are applied immediately and saved to the file. 
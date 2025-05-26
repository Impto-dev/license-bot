# Discord License Manager Bot

A Discord bot for managing software licenses for C#, Python, JavaScript, and C++ projects.

## Features

- Generate and manage license keys for multiple programming languages
- Assign licenses to Discord users
- Verify license validity
- Set expiration dates for licenses
- Revoke or delete licenses
- Track license usage

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- A Discord account and a registered Discord application/bot

### Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "TOKEN" section, click "Copy" to copy your bot token
5. Under "Privileged Gateway Intents", enable:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### Step 2: Invite the Bot to Your Server

1. Go to the "OAuth2" > "URL Generator" tab
2. Select the following scopes:
   - `bot`
   - `applications.commands`
3. Select the following bot permissions:
   - "Read Messages/View Channels"
   - "Send Messages"
   - "Read Message History"
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### Step 3: Configure the Bot

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the setup script to configure your bot:
   ```
   node setup.js
   ```
   Follow the prompts to enter your:
   - Discord bot token
   - Command prefix (default is `!`)
   - Your Discord user ID (for owner privileges)
   - Additional admin user IDs (comma-separated)

Alternatively, you can manually create a `.env` file based on the `.env-example` template.

### Step 4: Run the Bot

```
npm start
```

## Command Usage

### General Commands

- `!help` - Show available commands
- `!verify <license_key>` - Verify a license key
- `!list` - List your licenses

### Admin Commands

- `!create <language> [email] [expiration_days]` - Create a new license
- `!assign <license_key> <@user>` - Assign a license to a user
- `!revoke <license_key>` - Revoke/deactivate a license
- `!delete <license_key>` - Delete a license from the database
- `!list <@user>` - List licenses for another user

## How It Works

### License Keys

License keys are generated in the format `XXXX-XXXX-XXXX-XXXX` with a prefix indicating the language:
- C#: C...
- Python: P...
- JavaScript: J...
- C++: C...

### Database

The bot uses SQLite to store license information locally:
- `licenses.db` - Contains tables for licenses and usage logs
- Data is stored in the `./data` directory

### Environment Variables

The bot uses a `.env` file for configuration:
- `DISCORD_TOKEN` - Your Discord bot token
- `PREFIX` - Command prefix (default: `!`)
- `OWNER_ID` - Your Discord user ID for owner privileges
- `ADMIN_USERS` - Comma-separated list of admin user IDs

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
# Discord License Manager Bot

A Discord bot for managing software licenses for C#, Python, JavaScript, and C++ projects.

## Features

- Generate and manage license keys for multiple programming languages
- Assign licenses to Discord users
- Verify license validity
- Set expiration dates for licenses
- Revoke or delete licenses
- Track license usage
- Support for both prefix commands and slash commands

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- A Discord account and a registered Discord application/bot

### Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "TOKEN" section, click "Copy" to copy your bot token
5. Under "Privileged Gateway Intents", **IMPORTANT**: Enable the following intents:
   - **Message Content Intent** (required for prefix commands)
   - Server Members Intent (optional)
6. Note your application ID from the "General Information" tab (needed for slash commands)

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
   npm run setup
   ```
   Follow the prompts to enter your:
   - Discord bot token
   - Discord application ID (for slash commands)
   - Command prefix (default is `!`)
   - Your Discord user ID (for owner privileges)
   - Additional admin user IDs (comma-separated)

Alternatively, you can manually create a `.env` file based on the `.env-example` template.

### Step 4: Register Slash Commands

To register slash commands with Discord:

```
npm run deploy
```

This only needs to be done once after setting up or when you modify command definitions.

### Step 5: Run the Bot

```
npm start
```

## Command Usage

The bot supports both traditional prefix commands (e.g., `!help`) and slash commands (e.g., `/help`).

### General Commands

- `!help` or `/help` - Show available commands
- `!verify <license_key>` or `/verify` - Verify a license key
- `!redeem <license_key>` or `/redeem` - Redeem a license key for yourself
- `!list` or `/list` - List your licenses

### Admin Commands

- `!create <language> [email] [expiration_days]` or `/create` - Create a new license
- `!assign <license_key> <@user>` or `/assign` - Assign a license to a user
- `!revoke <license_key>` or `/revoke` - Revoke/deactivate a license
- `!delete <license_key>` or `/delete` - Delete a license from the database
- `!list <@user>` or `/list` - List licenses for another user

## Troubleshooting

### "Used disallowed intents" Error

If you see an error like `Error: Used disallowed intents`, you need to enable the required intents in the Discord Developer Portal:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "Bot" tab
4. Under "Privileged Gateway Intents", enable "Message Content Intent"
5. Save changes and restart your bot

### Command Not Working

If a command isn't working properly:

1. Check the console for error messages
2. Make sure you've registered slash commands with `npm run deploy`
3. Verify that the bot has the necessary permissions in your Discord server
4. Try using both the prefix version (`!command`) and slash version (`/command`)

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
- `CLIENT_ID` - Your Discord application ID (for slash commands)
- `PREFIX` - Command prefix (default: `!`)
- `OWNER_ID` - Your Discord user ID for owner privileges
- `ADMIN_USERS` - Comma-separated list of admin user IDs

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
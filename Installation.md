# 🚀 Installation

This guide will walk you through setting up the Discord License Manager Bot from scratch.

## Prerequisites

Before starting, ensure you have:

- [Node.js](https://nodejs.org/) (v16.9.0 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Discord account](https://discord.com/) with administrator permissions on your server
- Basic knowledge of command line operations

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on "New Application" and give it a name
3. Navigate to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable all intents
5. Copy your bot token (you'll need this later)

## Step 2: Invite the Bot to Your Server

1. Go to the "OAuth2" tab in your application
2. In the "URL Generator" section, select the following scopes:
   - `bot`
   - `applications.commands`
3. In the "Bot Permissions" section, select:
   - "Administrator" (or customize with specific permissions)
4. Copy the generated URL and open it in your browser
5. Select your server and click "Authorize"

## Step 3: Clone the Repository

```bash
git clone https://github.com/yourusername/discord-license-manager.git
cd discord-license-manager
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_server_id
API_PORT=3000
DASHBOARD_PORT=3001
DASHBOARD_TOKEN=your_dashboard_access_token
```

Replace the placeholder values with your actual information:
- `BOT_TOKEN`: The token from Step 1
- `CLIENT_ID`: Your application's client ID (found in the General Information tab)
- `GUILD_ID`: Your Discord server's ID (Enable Developer Mode in Discord, right-click your server icon, and select "Copy ID")
- `DASHBOARD_TOKEN`: Create a secure random string for dashboard access

## Step 6: Set Up the Database

```bash
node setup.js
```

This creates the SQLite database and necessary tables.

## Step 7: Deploy Commands

```bash
node deploy-commands.js
```

This registers all slash commands with Discord.

## Step 8: Start the Bot

```bash
node index.js
```

For production deployment, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start index.js --name "license-bot"
```

## Step 9: Verify Installation

In your Discord server, type `/help` to see if the bot responds with a list of available commands.

## Troubleshooting

### Bot doesn't respond to commands
- Check if the bot is online in your server member list
- Ensure the bot has proper permissions
- Verify your .env file contains the correct tokens and IDs
- Check console logs for errors

### Commands not appearing
- Run `node deploy-commands.js` again
- Make sure your bot has the `applications.commands` scope
- Wait a few minutes (Discord can take time to register commands)

### Database errors
- Delete the existing database file and run `node setup.js` again
- Check file permissions in your directory

## Next Steps

After installation, proceed to [Configuration](Configuration) to customize your bot settings. 
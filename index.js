const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { setupDatabase } = require('./database');

// Create config object from environment variables
const config = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.PREFIX || '!',
  ownerId: process.env.OWNER_ID,
  adminUsers: process.env.ADMIN_USERS ? process.env.ADMIN_USERS.split(',').map(id => id.trim()) : []
};

console.log('Admin config:', { 
  ownerId: config.ownerId, 
  adminCount: config.adminUsers.length
});

// Create a new client instance with the minimum required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Needed for basic functionality
    GatewayIntentBits.GuildMessages,     // Needed for message commands
    GatewayIntentBits.MessageContent     // Needed to read message content for prefix commands
  ]
});

client.commands = new Collection();
client.config = config;

// Initialize database
setupDatabase();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Event handler for ready event
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Slash commands: ${Array.from(client.commands.keys()).join(', ')}`);
});

// Event handler for slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    console.log(`User ${interaction.user.tag} (${interaction.user.id}) executing command: ${interaction.commandName}`);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error executing this command!', flags: 64 });
    } else {
      await interaction.reply({ content: 'There was an error executing this command!', flags: 64 });
    }
  }
});

// Event handler for prefix commands
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    console.log(`User ${message.author.tag} (${message.author.id}) executing command: ${commandName}`);
    // For backwards compatibility with prefix commands
    if (command.executeMessage) {
      await command.executeMessage(message, args);
    } else if (typeof command.execute === 'function') {
      // Fallback to execute method if executeMessage doesn't exist
      await command.execute(message, args);
    } else {
      console.error(`Command ${commandName} is missing both executeMessage and execute methods`);
    }
  } catch (error) {
    console.error(error);
    await message.reply('There was an error executing that command!');
  }
});

// Login to Discord with your client's token
client.login(config.token); 
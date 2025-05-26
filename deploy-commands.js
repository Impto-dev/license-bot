require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load command files
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    // Check if data is already a SlashCommandBuilder (has toJSON method)
    if (typeof command.data.toJSON === 'function') {
      commands.push(command.data.toJSON());
    } 
    // For old format commands, create a basic slash command
    else if (command.data.name) {
      const slashCommand = new SlashCommandBuilder()
        .setName(command.data.name)
        .setDescription(`${command.data.name} command`);
      
      commands.push(slashCommand.toJSON());
      console.log(`[INFO] Auto-converted ${command.data.name} to slash command format`);
    } else {
      console.log(`[WARNING] The command at ${filePath} has an invalid data format.`);
    }
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})(); 
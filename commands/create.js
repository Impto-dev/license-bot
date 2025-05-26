const { addLicense, generateLicenseKey } = require('../database');
const { isAdmin } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

// Define game categories
const validGames = [
  { name: 'Fortnite', value: 'fortnite', prefix: 'F' },
  { name: 'FiveM', value: 'fivem', prefix: 'FM' },
  { name: 'GTA V', value: 'gtav', prefix: 'GTA' },
  { name: 'Escape From Tarkov', value: 'eft', prefix: 'EFT' },
  { name: 'Black Ops 6', value: 'bo6', prefix: 'BO6' },
  { name: 'Warzone', value: 'warzone', prefix: 'WZ' },
  { name: 'Counter-Strike 2', value: 'cs2', prefix: 'CS2' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create a new license key')
    .addStringOption(option => {
      const gameOption = option
        .setName('game')
        .setDescription('Game for the license')
        .setRequired(true);
      
      // Add each game as a choice
      validGames.forEach(game => {
        gameOption.addChoices({ name: game.name, value: game.value });
      });
      
      return gameOption;
    })
    .addStringOption(option => 
      option.setName('email')
        .setDescription('Email to associate with the license')
        .setRequired(false))
    .addIntegerOption(option => 
      option.setName('expiration_days')
        .setDescription('Number of days until the license expires')
        .setRequired(false)
        .setMinValue(1)),
  
  async execute(interaction) {
    try {
      // Create a response handler
      const handler = createResponseHandler(interaction, true);
      
      // Immediately defer the reply to prevent timeout
      try {
        await interaction.deferReply();
      } catch (error) {
        console.error('Failed to defer reply:', error);
        // Continue with command execution - we'll just handle the case where we can't reply later
      }
      
      // Check if user has admin privileges
      if (!isAdmin(handler.getUser().id, interaction.client.config)) {
        return await handler.ephemeralReply('You do not have permission to use this command.');
      }

      // Get options from the interaction
      const gameValue = interaction.options.getString('game');
      const email = interaction.options.getString('email');
      const expirationDays = interaction.options.getInteger('expiration_days');

      // Validate game
      const gameInfo = validGames.find(g => g.value === gameValue);
      if (!gameInfo) {
        return await handler.ephemeralReply(`Invalid game. Please select one of the available options.`);
      }

      // Generate license key with game prefix
      const licenseKey = generateLicenseKey(gameInfo.prefix);
      
      // Prepare license data
      const issueDate = Math.floor(Date.now() / 1000);
      let expirationDate = null;
      
      if (expirationDays && !isNaN(expirationDays)) {
        expirationDate = issueDate + (expirationDays * 86400); // Convert days to seconds
      }
      
      const licenseData = {
        license_key: licenseKey,
        language: gameValue, // Keep 'language' field name for database compatibility
        email,
        issue_date: issueDate,
        expiration_date: expirationDate,
        metadata: { created_by: handler.getUser().id }
      };

      // Add license to database
      const licenseId = await addLicense(licenseData);
      
      // Format expiration information
      let expirationInfo = 'never expires';
      if (expirationDate) {
        const expirationDateObj = new Date(expirationDate * 1000);
        expirationInfo = `expires on ${expirationDateObj.toLocaleDateString()}`;
      }
      
      // Generate response message
      const responseMessage = `✅ Created new ${gameInfo.name} license:\n\`${licenseKey}\`\nThis license ${expirationInfo}.`;
      
      // Try to send the response
      try {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply(responseMessage);
        } else if (!interaction.replied) {
          await interaction.reply(responseMessage);
        } else {
          await interaction.followUp(responseMessage);
        }
      } catch (error) {
        console.error('Error responding to slash command:', error);
        // License was created successfully, but we couldn't respond to the user
        // This can happen if the interaction timed out
      }
      
      // Return the license ID for potential future use
      return licenseId;
    } catch (error) {
      console.error('Error in create command:', error);
      try {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply('An error occurred while creating the license.');
        } else if (!interaction.replied) {
          await interaction.reply({ content: 'An error occurred while creating the license.', flags: 64 });
        } else {
          await interaction.followUp({ content: 'An error occurred while creating the license.', flags: 64 });
        }
      } catch (replyError) {
        console.error('Failed to send error response:', replyError);
      }
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const handler = createResponseHandler(message, false);
    
    // Check if user has admin privileges
    if (!isAdmin(handler.getUser().id, message.client.config)) {
      return await handler.reply('You do not have permission to use this command.');
    }

    // Validate arguments
    if (args.length < 1) {
      const gameList = validGames.map(g => g.value).join(', ');
      return await handler.reply(`Usage: !create <game> [email] [expiration_days]\nAvailable games: ${gameList}`);
    }

    const gameValue = args[0].toLowerCase();
    const email = args.length > 1 ? args[1] : null;
    const expirationDays = args.length > 2 ? parseInt(args[2]) : null;

    // Validate game
    const gameInfo = validGames.find(g => g.value === gameValue);
    if (!gameInfo) {
      const gameList = validGames.map(g => g.value).join(', ');
      return await handler.reply(`Invalid game. Please use one of: ${gameList}`);
    }

    // Generate license key with game prefix
    const licenseKey = generateLicenseKey(gameInfo.prefix);
    
    // Prepare license data
    const issueDate = Math.floor(Date.now() / 1000);
    let expirationDate = null;
    
    if (expirationDays && !isNaN(expirationDays)) {
      expirationDate = issueDate + (expirationDays * 86400); // Convert days to seconds
    }
    
    const licenseData = {
      license_key: licenseKey,
      language: gameValue, // Keep 'language' field name for database compatibility
      email,
      issue_date: issueDate,
      expiration_date: expirationDate,
      metadata: { created_by: handler.getUser().id }
    };

    try {
      // Add license to database
      const licenseId = await addLicense(licenseData);
      
      // Format expiration information
      let expirationInfo = 'never expires';
      if (expirationDate) {
        const expirationDateObj = new Date(expirationDate * 1000);
        expirationInfo = `expires on ${expirationDateObj.toLocaleDateString()}`;
      }
      
      // Send success message
      await handler.reply(`✅ Created new ${gameInfo.name} license:\n\`${licenseKey}\`\nThis license ${expirationInfo}.`);
    } catch (error) {
      console.error('Error creating license:', error);
      await handler.reply('An error occurred while creating the license.');
    }
  }
}; 
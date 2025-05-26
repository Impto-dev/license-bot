const { addLicense, generateLicenseKey } = require('../database');
const { isAdmin } = require('../utils');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');
const fs = require('fs');
const path = require('path');

// Define game categories - keep in sync with create.js
const validGames = [
  { name: 'Fortnite', value: 'fortnite', prefix: 'F' },
  { name: 'FiveM', value: 'fivem', prefix: 'FM' },
  { name: 'GTA V', value: 'gtav', prefix: 'GTA' },
  { name: 'Escape From Tarkov', value: 'eft', prefix: 'EFT' },
  { name: 'Black Ops 6', value: 'bo6', prefix: 'BO6' },
  { name: 'Warzone', value: 'warzone', prefix: 'WZ' },
  { name: 'Counter-Strike 2', value: 'cs2', prefix: 'CS2' }
];

// Define license durations - keep in sync with create.js
const durations = [
  { name: '1 Day', value: 'day_1', days: 1 },
  { name: '3 Days', value: 'day_3', days: 3 },
  { name: '7 Days', value: 'day_7', days: 7 },
  { name: '1 Month', value: 'month_1', days: 30 },
  { name: '3 Months', value: 'month_3', days: 90 },
  { name: '6 Months', value: 'month_6', days: 180 },
  { name: '9 Months', value: 'month_9', days: 270 },
  { name: '1 Year', value: 'month_12', days: 365 },
  { name: 'Lifetime', value: 'lifetime', days: null }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bulk')
    .setDescription('Generate multiple license keys in bulk')
    .addStringOption(option => {
      const gameOption = option
        .setName('game')
        .setDescription('Game for the licenses')
        .setRequired(true);
      
      // Add each game as a choice
      validGames.forEach(game => {
        gameOption.addChoices({ name: game.name, value: game.value });
      });
      
      return gameOption;
    })
    .addStringOption(option => {
      const durationOption = option
        .setName('duration')
        .setDescription('Duration of the licenses')
        .setRequired(true);
      
      // Add each duration as a choice
      durations.forEach(duration => {
        durationOption.addChoices({ name: duration.name, value: duration.value });
      });
      
      return durationOption;
    })
    .addIntegerOption(option => 
      option.setName('count')
        .setDescription('Number of licenses to generate (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addStringOption(option => 
      option.setName('prefix')
        .setDescription('Custom prefix for the license keys (optional)')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('email')
        .setDescription('Email domain to associate with the licenses (optional)')
        .setRequired(false)),
  
  async execute(interaction) {
    try {
      // Create a response handler
      const handler = createResponseHandler(interaction, true);
      
      // Immediately defer the reply to prevent timeout for bulk operations
      await interaction.deferReply();
      
      // Check if user has admin privileges
      if (!isAdmin(handler.getUser().id, interaction.client.config)) {
        return await handler.ephemeralReply('You do not have permission to use this command.');
      }

      // Get options from the interaction
      const gameValue = interaction.options.getString('game');
      const durationValue = interaction.options.getString('duration');
      const count = interaction.options.getInteger('count');
      const customPrefix = interaction.options.getString('prefix') || '';
      const emailDomain = interaction.options.getString('email') || '';

      // Validate game
      const gameInfo = validGames.find(g => g.value === gameValue);
      if (!gameInfo) {
        return await handler.ephemeralReply(`Invalid game. Please select one of the available options.`);
      }

      // Validate and get duration
      const durationInfo = durations.find(d => d.value === durationValue);
      if (!durationInfo) {
        return await handler.ephemeralReply(`Invalid duration. Please select one of the available options.`);
      }

      // Create an array to hold the generated license keys
      const generatedLicenses = [];
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Create a file to store the licenses
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `licenses-${gameInfo.value}-${timestamp}.txt`;
      const filePath = path.join(tempDir, fileName);
      
      // Set up a write stream
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(`License Keys for ${gameInfo.name} - ${durationInfo.name}\n`);
      writeStream.write(`Generated on ${new Date().toLocaleString()}\n\n`);
      
      // Process to generate licenses
      const issueDate = Math.floor(Date.now() / 1000);
      
      // Set expiration date if not lifetime
      let expirationDate = null;
      if (durationInfo.days !== null) {
        expirationDate = issueDate + (durationInfo.days * 86400); // Convert days to seconds
      }

      // Generate and save licenses
      for (let i = 0; i < count; i++) {
        // Generate license key with combined prefix
        const finalPrefix = `${customPrefix}${gameInfo.prefix}`;
        const licenseKey = generateLicenseKey(finalPrefix);
        
        // Generate an email if domain was provided
        let email = null;
        if (emailDomain) {
          const randomUsername = Math.random().toString(36).substring(2, 10);
          email = `${randomUsername}@${emailDomain.replace('@', '')}`;
        }
        
        // Prepare license data
        const licenseData = {
          license_key: licenseKey,
          language: gameValue, // Keep 'language' field name for database compatibility
          email,
          issue_date: issueDate,
          expiration_date: expirationDate,
          metadata: { 
            created_by: handler.getUser().id,
            bulk_generation: true,
            batch_id: timestamp
          }
        };

        // Add license to database
        await addLicense(licenseData);
        
        // Add to generated licenses list
        generatedLicenses.push(licenseKey);
        
        // Write to file
        writeStream.write(`${licenseKey}\n`);
      }
      
      // Close the write stream
      writeStream.end();
      
      // Format expiration information
      let expirationInfo = 'never expire (Lifetime)';
      if (expirationDate) {
        const expirationDateObj = new Date(expirationDate * 1000);
        expirationInfo = `expire on ${expirationDateObj.toLocaleDateString()} (${durationInfo.name})`;
      }
      
      // Create a file attachment
      const attachment = new AttachmentBuilder(filePath, { name: fileName });
      
      // Generate response message
      const responseMessage = `✅ Generated ${count} ${gameInfo.name} licenses that ${expirationInfo}.`;
      
      // Send the response with the file attachment
      await interaction.editReply({
        content: responseMessage,
        files: [attachment]
      });
      
      // Clean up the file after a delay (give Discord time to upload it)
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('Error deleting temporary file:', error);
        }
      }, 10000);
      
      return generatedLicenses;
    } catch (error) {
      console.error('Error in bulk command:', error);
      try {
        await interaction.editReply('An error occurred while generating licenses.');
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
    if (args.length < 3) {
      const gameList = validGames.map(g => g.value).join(', ');
      const durationList = durations.map(d => d.value).join(', ');
      return await handler.reply(`Usage: !bulk <game> <duration> <count> [prefix] [emailDomain]\nAvailable games: ${gameList}\nAvailable durations: ${durationList}`);
    }

    const gameValue = args[0].toLowerCase();
    const durationValue = args[1].toLowerCase();
    const count = parseInt(args[2], 10);
    const customPrefix = args.length > 3 ? args[3] : '';
    const emailDomain = args.length > 4 ? args[4] : '';

    // Validate game
    const gameInfo = validGames.find(g => g.value === gameValue);
    if (!gameInfo) {
      const gameList = validGames.map(g => g.value).join(', ');
      return await handler.reply(`Invalid game. Please use one of: ${gameList}`);
    }

    // Validate duration
    const durationInfo = durations.find(d => d.value === durationValue);
    if (!durationInfo) {
      const durationList = durations.map(d => d.value).join(', ');
      return await handler.reply(`Invalid duration. Please use one of: ${durationList}`);
    }
    
    // Validate count
    if (isNaN(count) || count < 1 || count > 100) {
      return await handler.reply('Count must be a number between 1 and 100.');
    }
    
    // Create an array to hold the generated license keys
    const generatedLicenses = [];
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Send initial response
    await handler.reply(`Generating ${count} ${gameInfo.name} licenses. Please wait...`);
    
    // Create a file to store the licenses
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `licenses-${gameInfo.value}-${timestamp}.txt`;
    const filePath = path.join(tempDir, fileName);
    
    // Set up a write stream
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(`License Keys for ${gameInfo.name} - ${durationInfo.name}\n`);
    writeStream.write(`Generated on ${new Date().toLocaleString()}\n\n`);
    
    // Process to generate licenses
    const issueDate = Math.floor(Date.now() / 1000);
    
    // Set expiration date if not lifetime
    let expirationDate = null;
    if (durationInfo.days !== null) {
      expirationDate = issueDate + (durationInfo.days * 86400); // Convert days to seconds
    }

    try {
      // Generate and save licenses
      for (let i = 0; i < count; i++) {
        // Generate license key with combined prefix
        const finalPrefix = `${customPrefix}${gameInfo.prefix}`;
        const licenseKey = generateLicenseKey(finalPrefix);
        
        // Generate an email if domain was provided
        let email = null;
        if (emailDomain) {
          const randomUsername = Math.random().toString(36).substring(2, 10);
          email = `${randomUsername}@${emailDomain.replace('@', '')}`;
        }
        
        // Prepare license data
        const licenseData = {
          license_key: licenseKey,
          language: gameValue,
          email,
          issue_date: issueDate,
          expiration_date: expirationDate,
          metadata: { 
            created_by: handler.getUser().id,
            bulk_generation: true,
            batch_id: timestamp
          }
        };

        // Add license to database
        await addLicense(licenseData);
        
        // Add to generated licenses list
        generatedLicenses.push(licenseKey);
        
        // Write to file
        writeStream.write(`${licenseKey}\n`);
      }
      
      // Close the write stream
      writeStream.end();
      
      // Format expiration information
      let expirationInfo = 'never expire (Lifetime)';
      if (expirationDate) {
        const expirationDateObj = new Date(expirationDate * 1000);
        expirationInfo = `expire on ${expirationDateObj.toLocaleDateString()} (${durationInfo.name})`;
      }
      
      // Create a file attachment
      const attachment = new AttachmentBuilder(filePath, { name: fileName });
      
      // Send the response with the file attachment
      await message.channel.send({
        content: `✅ Generated ${count} ${gameInfo.name} licenses that ${expirationInfo}.`,
        files: [attachment]
      });
      
      // Clean up the file after a delay
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('Error deleting temporary file:', error);
        }
      }, 10000);
      
      return generatedLicenses;
    } catch (error) {
      console.error('Error in bulk command:', error);
      await handler.reply('An error occurred while generating licenses.');
    }
  }
}; 
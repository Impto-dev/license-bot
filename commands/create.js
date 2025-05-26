const { addLicense, generateLicenseKey } = require('../database');
const { isAdmin } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create a new license key')
    .addStringOption(option => 
      option.setName('language')
        .setDescription('Programming language for the license')
        .setRequired(true)
        .addChoices(
          { name: 'C#', value: 'c#' },
          { name: 'Python', value: 'python' },
          { name: 'JavaScript', value: 'js' },
          { name: 'C++', value: 'c++' }
        ))
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
    const handler = createResponseHandler(interaction, true);
    
    // Check if user has admin privileges
    if (!isAdmin(handler.getUser().id, interaction.client.config)) {
      return handler.ephemeralReply('You do not have permission to use this command.');
    }

    // Get options from the interaction
    const language = interaction.options.getString('language');
    const email = interaction.options.getString('email');
    const expirationDays = interaction.options.getInteger('expiration_days');

    // Validate language (should be redundant with choices, but good practice)
    const validLanguages = ['c#', 'python', 'js', 'c++'];
    if (!validLanguages.includes(language)) {
      return handler.ephemeralReply(`Invalid language. Please use one of: ${validLanguages.join(', ')}`);
    }

    // Generate license key
    const prefix = language.charAt(0).toUpperCase();
    const licenseKey = generateLicenseKey(prefix);
    
    // Prepare license data
    const issueDate = Math.floor(Date.now() / 1000);
    let expirationDate = null;
    
    if (expirationDays && !isNaN(expirationDays)) {
      expirationDate = issueDate + (expirationDays * 86400); // Convert days to seconds
    }
    
    const licenseData = {
      license_key: licenseKey,
      language,
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
      handler.reply(`✅ Created new ${language.toUpperCase()} license:\n\`${licenseKey}\`\nThis license ${expirationInfo}.`);
    } catch (error) {
      console.error('Error creating license:', error);
      handler.ephemeralReply('An error occurred while creating the license.');
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const handler = createResponseHandler(message, false);
    
    // Check if user has admin privileges
    if (!isAdmin(handler.getUser().id, message.client.config)) {
      return handler.reply('You do not have permission to use this command.');
    }

    // Validate arguments
    if (args.length < 1) {
      return handler.reply('Usage: !create <language> [email] [expiration_days]');
    }

    const language = args[0].toLowerCase();
    const email = args.length > 1 ? args[1] : null;
    const expirationDays = args.length > 2 ? parseInt(args[2]) : null;

    // Validate language
    const validLanguages = ['c#', 'python', 'js', 'c++'];
    if (!validLanguages.includes(language)) {
      return handler.reply(`Invalid language. Please use one of: ${validLanguages.join(', ')}`);
    }

    // Generate license key
    const prefix = language.charAt(0).toUpperCase();
    const licenseKey = generateLicenseKey(prefix);
    
    // Prepare license data
    const issueDate = Math.floor(Date.now() / 1000);
    let expirationDate = null;
    
    if (expirationDays && !isNaN(expirationDays)) {
      expirationDate = issueDate + (expirationDays * 86400); // Convert days to seconds
    }
    
    const licenseData = {
      license_key: licenseKey,
      language,
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
      handler.reply(`✅ Created new ${language.toUpperCase()} license:\n\`${licenseKey}\`\nThis license ${expirationInfo}.`);
    } catch (error) {
      console.error('Error creating license:', error);
      handler.reply('An error occurred while creating the license.');
    }
  }
}; 
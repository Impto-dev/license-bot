const { getLicenseByKey, addLicense, deleteLicense } = require('../database');
const { isAdmin, isLicenseExpired } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

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
    .setName('renew')
    .setDescription('Renew an existing license')
    .addStringOption(option => 
      option.setName('license_key')
        .setDescription('The license key to renew')
        .setRequired(true))
    .addStringOption(option => {
      const durationOption = option
        .setName('duration')
        .setDescription('New duration for the license')
        .setRequired(true);
      
      // Add each duration as a choice
      durations.forEach(duration => {
        durationOption.addChoices({ name: duration.name, value: duration.value });
      });
      
      return durationOption;
    })
    .addBooleanOption(option => 
      option.setName('extend')
        .setDescription('Extend from current expiration date instead of creating new period')
        .setRequired(false)),
  
  async execute(interaction) {
    try {
      // Create a response handler
      const handler = createResponseHandler(interaction, true);
      
      // Defer reply to prevent timeout
      await interaction.deferReply();
      
      // Check if user has admin privileges
      if (!isAdmin(handler.getUser().id, interaction.client.config)) {
        return await handler.ephemeralReply('You do not have permission to use this command.');
      }

      // Get options from the interaction
      const licenseKey = interaction.options.getString('license_key').toUpperCase();
      const durationValue = interaction.options.getString('duration');
      const extend = interaction.options.getBoolean('extend') || false;

      // Validate and get duration
      const durationInfo = durations.find(d => d.value === durationValue);
      if (!durationInfo) {
        return await handler.ephemeralReply(`Invalid duration. Please select one of the available options.`);
      }

      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      // Check if license exists
      if (!license) {
        return await handler.ephemeralReply(`License key \`${licenseKey}\` not found.`);
      }
      
      // Prepare new license data
      const currentTime = Math.floor(Date.now() / 1000);
      let newExpirationDate = null;
      
      // Set expiration date based on options
      if (durationInfo.days !== null) {
        if (extend && license.expiration_date && !isLicenseExpired(license)) {
          // Extend from current expiration date
          newExpirationDate = license.expiration_date + (durationInfo.days * 86400);
        } else {
          // Start fresh from now
          newExpirationDate = currentTime + (durationInfo.days * 86400);
        }
      }
      
      // Create metadata with renewal information
      const metadata = license.metadata ? JSON.parse(license.metadata) : {};
      
      // Add renewal history if it doesn't exist
      if (!metadata.renewalHistory) {
        metadata.renewalHistory = [];
      }
      
      // Add this renewal to history
      metadata.renewalHistory.push({
        renewedBy: handler.getUser().id,
        renewedAt: currentTime,
        previousExpiration: license.expiration_date,
        newExpiration: newExpirationDate,
        duration: durationInfo.name
      });
      
      // Create updated license data
      const updatedLicenseData = {
        license_key: license.license_key,
        user_id: license.user_id,
        user_name: license.user_name,
        email: license.email,
        language: license.language,
        issue_date: license.issue_date,
        expiration_date: newExpirationDate,
        metadata: JSON.stringify(metadata)
      };
      
      // Delete the old license and create a new one with updated expiration
      await deleteLicense(license.id);
      await addLicense(updatedLicenseData);
      
      // Format response message
      let responseMessage = `✅ License \`${licenseKey}\` has been renewed with **${durationInfo.name}** duration.`;
      
      if (durationInfo.days === null) {
        responseMessage += ' This license will never expire (Lifetime).';
      } else {
        const expirationDate = new Date(newExpirationDate * 1000);
        responseMessage += ` New expiration date: ${expirationDate.toLocaleDateString()}.`;
        
        if (extend) {
          responseMessage += ' (Extended from previous expiration date)';
        } else {
          responseMessage += ' (Started fresh from today)';
        }
      }
      
      // Send the response
      await interaction.editReply(responseMessage);
      
      return license.id;
    } catch (error) {
      console.error('Error in renew command:', error);
      try {
        await interaction.editReply('An error occurred while renewing the license.');
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
    if (args.length < 2) {
      const durationList = durations.map(d => d.value).join(', ');
      return await handler.reply(`Usage: !renew <license_key> <duration> [extend]\nAvailable durations: ${durationList}\nAdd 'true' as the third parameter to extend from current expiration date.`);
    }

    const licenseKey = args[0].toUpperCase();
    const durationValue = args[1].toLowerCase();
    const extend = args.length > 2 && args[2].toLowerCase() === 'true';

    // Validate duration
    const durationInfo = durations.find(d => d.value === durationValue);
    if (!durationInfo) {
      const durationList = durations.map(d => d.value).join(', ');
      return await handler.reply(`Invalid duration. Please use one of: ${durationList}`);
    }

    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      // Check if license exists
      if (!license) {
        return await handler.reply(`License key \`${licenseKey}\` not found.`);
      }
      
      // Prepare new license data
      const currentTime = Math.floor(Date.now() / 1000);
      let newExpirationDate = null;
      
      // Set expiration date based on options
      if (durationInfo.days !== null) {
        if (extend && license.expiration_date && !isLicenseExpired(license)) {
          // Extend from current expiration date
          newExpirationDate = license.expiration_date + (durationInfo.days * 86400);
        } else {
          // Start fresh from now
          newExpirationDate = currentTime + (durationInfo.days * 86400);
        }
      }
      
      // Create metadata with renewal information
      const metadata = license.metadata ? JSON.parse(license.metadata) : {};
      
      // Add renewal history if it doesn't exist
      if (!metadata.renewalHistory) {
        metadata.renewalHistory = [];
      }
      
      // Add this renewal to history
      metadata.renewalHistory.push({
        renewedBy: handler.getUser().id,
        renewedAt: currentTime,
        previousExpiration: license.expiration_date,
        newExpiration: newExpirationDate,
        duration: durationInfo.name
      });
      
      // Create updated license data
      const updatedLicenseData = {
        license_key: license.license_key,
        user_id: license.user_id,
        user_name: license.user_name,
        email: license.email,
        language: license.language,
        issue_date: license.issue_date,
        expiration_date: newExpirationDate,
        metadata: JSON.stringify(metadata)
      };
      
      // Delete the old license and create a new one with updated expiration
      await deleteLicense(license.id);
      await addLicense(updatedLicenseData);
      
      // Format response message
      let responseMessage = `✅ License \`${licenseKey}\` has been renewed with **${durationInfo.name}** duration.`;
      
      if (durationInfo.days === null) {
        responseMessage += ' This license will never expire (Lifetime).';
      } else {
        const expirationDate = new Date(newExpirationDate * 1000);
        responseMessage += ` New expiration date: ${expirationDate.toLocaleDateString()}.`;
        
        if (extend) {
          responseMessage += ' (Extended from previous expiration date)';
        } else {
          responseMessage += ' (Started fresh from today)';
        }
      }
      
      // Send the response
      await handler.reply(responseMessage);
      
      return license.id;
    } catch (error) {
      console.error('Error in renew command:', error);
      await handler.reply('An error occurred while renewing the license.');
    }
  }
}; 
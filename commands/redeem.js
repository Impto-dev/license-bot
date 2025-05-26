const { getLicenseByKey, assignLicense } = require('../database');
const { isLicenseExpired } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

// Game name mapping
const gameNames = {
  'fortnite': 'Fortnite',
  'fivem': 'FiveM',
  'gtav': 'GTA V',
  'eft': 'Escape From Tarkov',
  'bo6': 'Black Ops 6',
  'warzone': 'Warzone',
  'cs2': 'Counter-Strike 2',
  // Legacy support for old licenses
  'c#': 'C#',
  'python': 'Python',
  'js': 'JavaScript',
  'c++': 'C++'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Redeem a license key for yourself')
    .addStringOption(option => 
      option.setName('license_key')
        .setDescription('The license key to redeem')
        .setRequired(true)),
  
  async execute(interaction) {
    try {
      // Create a response handler
      const handler = createResponseHandler(interaction, true);
      
      // Immediately defer the reply to prevent timeout
      try {
        await interaction.deferReply();
      } catch (error) {
        console.error('Failed to defer reply:', error);
      }
      
      const licenseKey = interaction.options.getString('license_key').toUpperCase();
      const userId = interaction.user.id;
      const userName = interaction.user.username;
      
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return await handler.ephemeralReply('❌ Invalid license key. This license does not exist.');
      }
      
      // Check if license is already assigned
      if (license.user_id) {
        if (license.user_id === userId) {
          return await handler.ephemeralReply('This license is already assigned to you.');
        } else {
          return await handler.ephemeralReply('❌ This license is already assigned to another user.');
        }
      }
      
      // Check if license is active
      const isExpired = isLicenseExpired(license);
      const isActive = license.is_active === 1;
      
      if (!isActive) {
        return await handler.ephemeralReply('❌ This license has been deactivated and cannot be redeemed.');
      }
      
      if (isExpired) {
        return await handler.ephemeralReply('⏱️ This license has expired and cannot be redeemed.');
      }
      
      // Assign license to user
      await assignLicense(license.id, userId, userName);
      
      // Get game name (with fallback to uppercase if not found)
      const gameName = gameNames[license.language] || license.language.toUpperCase();
      
      // Format response message
      const responseMessage = `✅ Successfully redeemed license for ${gameName}!\n` +
                             `License key: \`${licenseKey}\``;
      
      // Try to send the response
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply(responseMessage);
      } else if (!interaction.replied) {
        await interaction.reply(responseMessage);
      } else {
        await interaction.followUp(responseMessage);
      }
      
    } catch (error) {
      console.error('Error in redeem command:', error);
      try {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply('An error occurred while redeeming the license.');
        } else if (!interaction.replied) {
          await interaction.reply({ content: 'An error occurred while redeeming the license.', flags: 64 });
        } else {
          await interaction.followUp({ content: 'An error occurred while redeeming the license.', flags: 64 });
        }
      } catch (replyError) {
        console.error('Failed to send error response:', replyError);
      }
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const handler = createResponseHandler(message, false);
    
    // Validate arguments
    if (args.length < 1) {
      return await handler.reply('Usage: !redeem <license_key>');
    }
    
    const licenseKey = args[0].toUpperCase();
    const userId = message.author.id;
    const userName = message.author.username;
    
    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return await handler.reply('❌ Invalid license key. This license does not exist.');
      }
      
      // Check if license is already assigned
      if (license.user_id) {
        if (license.user_id === userId) {
          return await handler.reply('This license is already assigned to you.');
        } else {
          return await handler.reply('❌ This license is already assigned to another user.');
        }
      }
      
      // Check if license is active
      const isExpired = isLicenseExpired(license);
      const isActive = license.is_active === 1;
      
      if (!isActive) {
        return await handler.reply('❌ This license has been deactivated and cannot be redeemed.');
      }
      
      if (isExpired) {
        return await handler.reply('⏱️ This license has expired and cannot be redeemed.');
      }
      
      // Assign license to user
      await assignLicense(license.id, userId, userName);
      
      // Get game name (with fallback to uppercase if not found)
      const gameName = gameNames[license.language] || license.language.toUpperCase();
      
      await handler.reply(`✅ Successfully redeemed license for ${gameName}!\n` +
                        `License key: \`${licenseKey}\``);
    } catch (error) {
      console.error('Error redeeming license:', error);
      await handler.reply('An error occurred while redeeming the license.');
    }
  }
}; 
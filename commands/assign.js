const { getLicenseByKey, assignLicense } = require('../database');
const { isAdmin } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assign')
    .setDescription('Assign a license to a user')
    .addStringOption(option => 
      option.setName('license_key')
        .setDescription('The license key to assign')
        .setRequired(true))
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to assign the license to')
        .setRequired(true)),
  
  async execute(interaction) {
    // Create response handler and defer reply
    const handler = createResponseHandler(interaction, true);
    await handler.defer();
    
    // Check if user has admin privileges
    if (!isAdmin(handler.getUser().id, interaction.client.config)) {
      return await handler.ephemeralReply('You do not have permission to use this command.');
    }

    const licenseKey = interaction.options.getString('license_key').toUpperCase();
    const targetUser = interaction.options.getUser('user');
    
    if (!targetUser) {
      return await handler.ephemeralReply('Please provide a valid user.');
    }
    
    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return await handler.ephemeralReply('❌ Invalid license key. This license does not exist.');
      }
      
      // Assign license to user
      await assignLicense(license.id, targetUser.id, targetUser.username);
      
      await handler.reply(`✅ License \`${licenseKey}\` has been assigned to <@${targetUser.id}>.`);
    } catch (error) {
      console.error('Error assigning license:', error);
      await handler.ephemeralReply('An error occurred while assigning the license.');
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
      return await handler.reply('Usage: !assign <license_key> <@user>');
    }

    const licenseKey = args[0].toUpperCase();
    
    // Extract user ID from mention
    const userMention = args[1];
    const userId = userMention.replace(/[<@!>]/g, '');
    
    if (!userId.match(/^\d+$/)) {
      return await handler.reply('Please mention a valid user.');
    }
    
    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return await handler.reply('❌ Invalid license key. This license does not exist.');
      }
      
      // Get user information
      const user = await message.client.users.fetch(userId);
      if (!user) {
        return await handler.reply('❌ Could not find that user.');
      }
      
      const userName = user.username;
      
      // Assign license to user
      await assignLicense(license.id, userId, userName);
      
      await handler.reply(`✅ License \`${licenseKey}\` has been assigned to ${userMention}.`);
    } catch (error) {
      console.error('Error assigning license:', error);
      await handler.reply('An error occurred while assigning the license.');
    }
  }
}; 
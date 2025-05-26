const { getLicensesByUser } = require('../database');
const { formatLicense } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List licenses for yourself or another user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to list licenses for (admin only)')
        .setRequired(false)),
  
  async execute(interaction) {
    const handler = createResponseHandler(interaction, true);
    let targetUser = interaction.options.getUser('user');
    let userId = handler.getUser().id;
    
    // If a user is mentioned and the command issuer is an admin, list that user's licenses
    if (targetUser) {
      // Check if user has admin privileges to view others' licenses
      const isAdmin = interaction.client.config.adminUsers?.includes(handler.getUser().id);
      
      if (isAdmin) {
        userId = targetUser.id;
      } else {
        return handler.ephemeralReply('You do not have permission to view licenses for other users.');
      }
    }
    
    try {
      // Get licenses from database
      const licenses = await getLicensesByUser(userId);
      
      if (!licenses || licenses.length === 0) {
        return handler.reply('No licenses found.');
      }
      
      // Format licenses for display
      const licenseList = licenses.map(formatLicense).join('\n\n');
      
      // Send license list
      handler.reply(`Found ${licenses.length} license(s):\n\n${licenseList}`);
    } catch (error) {
      console.error('Error listing licenses:', error);
      handler.ephemeralReply('An error occurred while retrieving licenses.');
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const handler = createResponseHandler(message, false);
    let userId = message.author.id;
    
    // If a user is mentioned and the command issuer is an admin, list that user's licenses
    if (args.length > 0 && args[0].startsWith('<@') && args[0].endsWith('>')) {
      const mentionedUserId = args[0].replace(/[<@!>]/g, '');
      
      // Check if user has admin privileges to view others' licenses
      const isAdmin = message.client.config.adminUsers?.includes(message.author.id);
      
      if (isAdmin) {
        userId = mentionedUserId;
      } else {
        return handler.reply('You do not have permission to view licenses for other users.');
      }
    }
    
    try {
      // Get licenses from database
      const licenses = await getLicensesByUser(userId);
      
      if (!licenses || licenses.length === 0) {
        return handler.reply('No licenses found.');
      }
      
      // Format licenses for display
      const licenseList = licenses.map(formatLicense).join('\n\n');
      
      // Send license list
      handler.reply(`Found ${licenses.length} license(s):\n\n${licenseList}`);
    } catch (error) {
      console.error('Error listing licenses:', error);
      handler.reply('An error occurred while retrieving licenses.');
    }
  }
}; 
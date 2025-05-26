const { isAdmin } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays available commands'),
  
  async execute(interaction) {
    const isUserAdmin = isAdmin(interaction.user.id, interaction.client.config);
    const prefix = interaction.client.config.prefix;
    
    let helpText = `**License Manager Bot Commands**\n\n`;
    
    // Commands available to all users
    helpText += `**General Commands:**\n`;
    helpText += `\`${prefix}help\` or \`/help\` - Show this help message\n`;
    helpText += `\`${prefix}verify <license_key>\` or \`/verify\` - Verify a license key\n`;
    helpText += `\`${prefix}list\` or \`/list\` - List your licenses\n\n`;
    
    // Admin-only commands
    if (isUserAdmin) {
      helpText += `**Admin Commands:**\n`;
      helpText += `\`${prefix}create <language> [email] [expiration_days]\` or \`/create\` - Create a new license\n`;
      helpText += `\`${prefix}assign <license_key> <@user>\` or \`/assign\` - Assign a license to a user\n`;
      helpText += `\`${prefix}revoke <license_key>\` or \`/revoke\` - Revoke/deactivate a license\n`;
      helpText += `\`${prefix}delete <license_key>\` or \`/delete\` - Delete a license from the database\n`;
      helpText += `\`${prefix}list <@user>\` or \`/list\` - List licenses for another user\n`;
    }
    
    // Reply based on interaction type
    if (interaction.isChatInputCommand()) {
      await interaction.reply({ content: helpText });
    } else {
      await interaction.reply(helpText);
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const isUserAdmin = isAdmin(message.author.id, message.client.config);
    const prefix = message.client.config.prefix;
    
    let helpText = `**License Manager Bot Commands**\n\n`;
    
    // Commands available to all users
    helpText += `**General Commands:**\n`;
    helpText += `\`${prefix}help\` or \`/help\` - Show this help message\n`;
    helpText += `\`${prefix}verify <license_key>\` or \`/verify\` - Verify a license key\n`;
    helpText += `\`${prefix}list\` or \`/list\` - List your licenses\n\n`;
    
    // Admin-only commands
    if (isUserAdmin) {
      helpText += `**Admin Commands:**\n`;
      helpText += `\`${prefix}create <language> [email] [expiration_days]\` or \`/create\` - Create a new license\n`;
      helpText += `\`${prefix}assign <license_key> <@user>\` or \`/assign\` - Assign a license to a user\n`;
      helpText += `\`${prefix}revoke <license_key>\` or \`/revoke\` - Revoke/deactivate a license\n`;
      helpText += `\`${prefix}delete <license_key>\` or \`/delete\` - Delete a license from the database\n`;
      helpText += `\`${prefix}list <@user>\` or \`/list\` - List licenses for another user\n`;
    }
    
    message.reply(helpText);
  }
}; 
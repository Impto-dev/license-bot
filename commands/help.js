const { isAdmin } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');
const { createResponseHandler } = require('../command-helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays available commands'),
  
  async execute(interaction) {
    try {
      const handler = createResponseHandler(interaction, true);
      await handler.defer();
      
      const isUserAdmin = isAdmin(handler.getUser().id, interaction.client.config);
      const prefix = interaction.client.config.prefix;
      
      let helpText = `**License Manager Bot Commands**\n\n`;
      
      // Commands available to all users
      helpText += `**General Commands:**\n`;
      helpText += `\`${prefix}help\` or \`/help\` - Show this help message\n`;
      helpText += `\`${prefix}verify <license_key>\` or \`/verify\` - Verify a license key\n`;
      helpText += `\`${prefix}redeem <license_key>\` or \`/redeem\` - Redeem a license key for yourself\n`;
      helpText += `\`${prefix}list\` or \`/list\` - List your licenses\n\n`;
      
      // Admin-only commands
      if (isUserAdmin) {
        helpText += `**Admin Commands:**\n`;
        helpText += `\`${prefix}create <game> [email] [expiration_days]\` or \`/create\` - Create a new license\n`;
        helpText += `\`${prefix}assign <license_key> <@user>\` or \`/assign\` - Assign a license to a user\n`;
        helpText += `\`${prefix}revoke <license_key>\` or \`/revoke\` - Revoke/deactivate a license\n`;
        helpText += `\`${prefix}delete <license_key>\` or \`/delete\` - Delete a license from the database\n`;
        helpText += `\`${prefix}list <@user>\` or \`/list\` - List licenses for another user\n`;
      }

      helpText += `\n**Available Games:**\n`;
      helpText += `Fortnite, FiveM, GTA V, Escape From Tarkov (EFT), Black Ops 6 (BO6), Warzone, Counter-Strike 2 (CS2)`;
      
      // Reply based on interaction type
      await handler.reply(helpText);
    } catch (error) {
      console.error('Error in help command:', error);
      try {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply('An error occurred while displaying help information.');
        } else if (!interaction.replied) {
          await interaction.reply({ content: 'An error occurred while displaying help information.', flags: 64 });
        } else {
          await interaction.followUp({ content: 'An error occurred while displaying help information.', flags: 64 });
        }
      } catch (replyError) {
        console.error('Failed to send error response:', replyError);
      }
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const handler = createResponseHandler(message, false);
    const isUserAdmin = isAdmin(message.author.id, message.client.config);
    const prefix = message.client.config.prefix;
    
    let helpText = `**License Manager Bot Commands**\n\n`;
    
    // Commands available to all users
    helpText += `**General Commands:**\n`;
    helpText += `\`${prefix}help\` or \`/help\` - Show this help message\n`;
    helpText += `\`${prefix}verify <license_key>\` or \`/verify\` - Verify a license key\n`;
    helpText += `\`${prefix}redeem <license_key>\` or \`/redeem\` - Redeem a license key for yourself\n`;
    helpText += `\`${prefix}list\` or \`/list\` - List your licenses\n\n`;
    
    // Admin-only commands
    if (isUserAdmin) {
      helpText += `**Admin Commands:**\n`;
      helpText += `\`${prefix}create <game> [email] [expiration_days]\` or \`/create\` - Create a new license\n`;
      helpText += `\`${prefix}assign <license_key> <@user>\` or \`/assign\` - Assign a license to a user\n`;
      helpText += `\`${prefix}revoke <license_key>\` or \`/revoke\` - Revoke/deactivate a license\n`;
      helpText += `\`${prefix}delete <license_key>\` or \`/delete\` - Delete a license from the database\n`;
      helpText += `\`${prefix}list <@user>\` or \`/list\` - List licenses for another user\n`;
    }

    helpText += `\n**Available Games:**\n`;
    helpText += `Fortnite, FiveM, GTA V, Escape From Tarkov (EFT), Black Ops 6 (BO6), Warzone, Counter-Strike 2 (CS2)`;
    
    await message.reply(helpText);
  }
}; 
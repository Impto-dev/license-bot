const { isAdmin } = require('../utils');

module.exports = {
  data: { name: 'help' },
  async execute(message, args) {
    const isUserAdmin = isAdmin(message.author.id, message.client.config);
    const prefix = message.client.config.prefix;
    
    let helpText = `**License Manager Bot Commands**\n\n`;
    
    // Commands available to all users
    helpText += `**General Commands:**\n`;
    helpText += `\`${prefix}help\` - Show this help message\n`;
    helpText += `\`${prefix}verify <license_key>\` - Verify a license key\n`;
    helpText += `\`${prefix}list\` - List your licenses\n\n`;
    
    // Admin-only commands
    if (isUserAdmin) {
      helpText += `**Admin Commands:**\n`;
      helpText += `\`${prefix}create <language> [email] [expiration_days]\` - Create a new license\n`;
      helpText += `\`${prefix}assign <license_key> <@user>\` - Assign a license to a user\n`;
      helpText += `\`${prefix}revoke <license_key>\` - Revoke/deactivate a license\n`;
      helpText += `\`${prefix}delete <license_key>\` - Delete a license from the database\n`;
      helpText += `\`${prefix}list <@user>\` - List licenses for another user\n`;
    }
    
    message.reply(helpText);
  },
}; 
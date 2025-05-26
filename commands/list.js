const { getLicensesByUser } = require('../database');
const { formatLicense } = require('../utils');

module.exports = {
  data: { name: 'list' },
  async execute(message, args) {
    let userId = message.author.id;
    
    // If a user is mentioned and the command issuer is an admin, list that user's licenses
    if (args.length > 0 && args[0].startsWith('<@') && args[0].endsWith('>')) {
      const mentionedUserId = args[0].replace(/[<@!>]/g, '');
      
      // Check if user has admin privileges to view others' licenses
      const isAdmin = message.client.config.adminUsers?.includes(message.author.id);
      
      if (isAdmin) {
        userId = mentionedUserId;
      } else {
        return message.reply('You do not have permission to view licenses for other users.');
      }
    }
    
    try {
      // Get licenses from database
      const licenses = await getLicensesByUser(userId);
      
      if (!licenses || licenses.length === 0) {
        return message.reply('No licenses found.');
      }
      
      // Format licenses for display
      const licenseList = licenses.map(formatLicense).join('\n\n');
      
      // Send license list
      message.reply(`Found ${licenses.length} license(s):\n\n${licenseList}`);
    } catch (error) {
      console.error('Error listing licenses:', error);
      message.reply('An error occurred while retrieving licenses.');
    }
  },
}; 
const { getLicenseByKey, assignLicense } = require('../database');
const { isAdmin } = require('../utils');

module.exports = {
  data: { name: 'assign' },
  async execute(message, args) {
    // Check if user has admin privileges
    if (!isAdmin(message.author.id, message.client.config)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate arguments
    if (args.length < 2) {
      return message.reply('Usage: !assign <license_key> <@user>');
    }

    const licenseKey = args[0].toUpperCase();
    
    // Extract user ID from mention
    const userMention = args[1];
    const userId = userMention.replace(/[<@!>]/g, '');
    
    if (!userId.match(/^\d+$/)) {
      return message.reply('Please mention a valid user.');
    }
    
    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return message.reply('❌ Invalid license key. This license does not exist.');
      }
      
      // Get user information
      const user = await message.client.users.fetch(userId);
      if (!user) {
        return message.reply('❌ Could not find that user.');
      }
      
      const userName = user.username;
      
      // Assign license to user
      await assignLicense(license.id, userId, userName);
      
      message.reply(`✅ License \`${licenseKey}\` has been assigned to ${userMention}.`);
    } catch (error) {
      console.error('Error assigning license:', error);
      message.reply('An error occurred while assigning the license.');
    }
  },
}; 
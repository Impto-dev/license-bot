const { getLicenseByKey, deleteLicense } = require('../database');
const { isAdmin } = require('../utils');

module.exports = {
  data: { name: 'delete' },
  async execute(message, args) {
    // Check if user has admin privileges
    if (!isAdmin(message.author.id, message.client.config)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate arguments
    if (args.length < 1) {
      return message.reply('Usage: !delete <license_key>');
    }

    const licenseKey = args[0].toUpperCase();

    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return message.reply('❌ Invalid license key. This license does not exist.');
      }
      
      // Ask for confirmation
      const confirmMessage = await message.reply(`Are you sure you want to delete license \`${licenseKey}\`? This action cannot be undone. Reply with 'yes' to confirm.`);
      
      // Set up collector for confirmation
      const filter = m => m.author.id === message.author.id && ['yes', 'no'].includes(m.content.toLowerCase());
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
      
      // If no confirmation or "no", cancel
      if (collected.size === 0 || collected.first().content.toLowerCase() !== 'yes') {
        return message.reply('License deletion cancelled.');
      }
      
      // Delete license
      await deleteLicense(license.id);
      
      message.reply(`✅ License \`${licenseKey}\` has been permanently deleted.`);
    } catch (error) {
      console.error('Error deleting license:', error);
      message.reply('An error occurred while deleting the license.');
    }
  },
}; 
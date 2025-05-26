const { getLicenseByKey, updateLicenseStatus } = require('../database');
const { isAdmin } = require('../utils');

module.exports = {
  data: { name: 'revoke' },
  async execute(message, args) {
    // Check if user has admin privileges
    if (!isAdmin(message.author.id, message.client.config)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate arguments
    if (args.length < 1) {
      return message.reply('Usage: !revoke <license_key>');
    }

    const licenseKey = args[0].toUpperCase();

    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return message.reply('❌ Invalid license key. This license does not exist.');
      }
      
      // Check if license is already deactivated
      if (license.is_active === 0) {
        return message.reply('This license is already deactivated.');
      }
      
      // Deactivate license
      await updateLicenseStatus(license.id, false);
      
      message.reply(`✅ License \`${licenseKey}\` has been revoked/deactivated.`);
    } catch (error) {
      console.error('Error revoking license:', error);
      message.reply('An error occurred while revoking the license.');
    }
  },
}; 
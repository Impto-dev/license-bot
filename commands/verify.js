const { getLicenseByKey } = require('../database');
const { formatLicense, isLicenseExpired } = require('../utils');

module.exports = {
  data: { name: 'verify' },
  async execute(message, args) {
    // Validate arguments
    if (args.length < 1) {
      return message.reply('Usage: !verify <license_key>');
    }

    const licenseKey = args[0].toUpperCase();

    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return message.reply('❌ Invalid license key. This license does not exist.');
      }
      
      const isExpired = isLicenseExpired(license);
      const isActive = license.is_active === 1;
      
      if (!isActive) {
        return message.reply('❌ This license has been deactivated.');
      }
      
      if (isExpired) {
        return message.reply('⏱️ This license has expired.');
      }
      
      // License is valid
      message.reply(`✅ Valid license for ${license.language.toUpperCase()}:\n${formatLicense(license)}`);
    } catch (error) {
      console.error('Error verifying license:', error);
      message.reply('An error occurred while verifying the license.');
    }
  },
}; 
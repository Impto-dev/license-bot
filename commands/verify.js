const { getLicenseByKey } = require('../database');
const { formatLicense, isLicenseExpired } = require('../utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify a license key')
    .addStringOption(option => 
      option.setName('license_key')
        .setDescription('The license key to verify')
        .setRequired(true)),
  
  async execute(interaction) {
    // Get license key from options
    const licenseKey = interaction.options.getString('license_key').toUpperCase();

    try {
      // Get license from database
      const license = await getLicenseByKey(licenseKey);
      
      if (!license) {
        return interaction.reply({ content: '❌ Invalid license key. This license does not exist.', ephemeral: true });
      }
      
      const isExpired = isLicenseExpired(license);
      const isActive = license.is_active === 1;
      
      if (!isActive) {
        return interaction.reply({ content: '❌ This license has been deactivated.', ephemeral: true });
      }
      
      if (isExpired) {
        return interaction.reply({ content: '⏱️ This license has expired.', ephemeral: true });
      }
      
      // License is valid
      interaction.reply(`✅ Valid license for ${license.language.toUpperCase()}:\n${formatLicense(license)}`);
    } catch (error) {
      console.error('Error verifying license:', error);
      interaction.reply({ content: 'An error occurred while verifying the license.', ephemeral: true });
    }
  },
  
  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
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
  }
}; 
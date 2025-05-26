const { addLicense, generateLicenseKey } = require('../database');
const { isAdmin } = require('../utils');

module.exports = {
  data: { name: 'create' },
  async execute(message, args) {
    // Check if user has admin privileges
    if (!isAdmin(message.author.id, message.client.config)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate arguments
    if (args.length < 1) {
      return message.reply('Usage: !create <language> [email] [expiration_days]');
    }

    const language = args[0].toLowerCase();
    const email = args.length > 1 ? args[1] : null;
    const expirationDays = args.length > 2 ? parseInt(args[2]) : null;

    // Validate language
    const validLanguages = ['c#', 'python', 'js', 'c++'];
    if (!validLanguages.includes(language)) {
      return message.reply(`Invalid language. Please use one of: ${validLanguages.join(', ')}`);
    }

    // Generate license key
    const prefix = language.charAt(0).toUpperCase();
    const licenseKey = generateLicenseKey(prefix);
    
    // Prepare license data
    const issueDate = Math.floor(Date.now() / 1000);
    let expirationDate = null;
    
    if (expirationDays && !isNaN(expirationDays)) {
      expirationDate = issueDate + (expirationDays * 86400); // Convert days to seconds
    }
    
    const licenseData = {
      license_key: licenseKey,
      language,
      email,
      issue_date: issueDate,
      expiration_date: expirationDate,
      metadata: { created_by: message.author.id }
    };

    try {
      // Add license to database
      const licenseId = await addLicense(licenseData);
      
      // Format expiration information
      let expirationInfo = 'never expires';
      if (expirationDate) {
        const expirationDateObj = new Date(expirationDate * 1000);
        expirationInfo = `expires on ${expirationDateObj.toLocaleDateString()}`;
      }
      
      // Send success message
      message.reply(`✅ Created new ${language.toUpperCase()} license:\n\`${licenseKey}\`\nThis license ${expirationInfo}.`);
    } catch (error) {
      console.error('Error creating license:', error);
      message.reply('An error occurred while creating the license.');
    }
  },
}; 
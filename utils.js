/**
 * Check if a user is an admin
 * @param {string} userId - Discord user ID
 * @param {object} config - Bot configuration
 * @returns {boolean} - True if user is an admin
 */
function isAdmin(userId, config) {
  // If no admin users are specified, only the bot owner can use admin commands
  if (!config.adminUsers || config.adminUsers.length === 0) {
    return userId === process.env.OWNER_ID;
  }
  
  // Check if user is in the admin list
  return config.adminUsers.includes(userId);
}

/**
 * Format a timestamp for display
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} - Formatted date string
 */
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Check if a license is expired
 * @param {object} license - License object from database
 * @returns {boolean} - True if license is expired
 */
function isLicenseExpired(license) {
  if (!license.expiration_date) return false; // Never expires
  
  const now = Math.floor(Date.now() / 1000);
  return now > license.expiration_date;
}

/**
 * Format a license object for display
 * @param {object} license - License object from database
 * @returns {string} - Formatted license information
 */
function formatLicense(license) {
  const isExpired = isLicenseExpired(license);
  const isActive = license.is_active === 1;
  
  let status = '✅ Active';
  if (!isActive) {
    status = '❌ Deactivated';
  } else if (isExpired) {
    status = '⏱️ Expired';
  }
  
  let expirationInfo = 'Never expires';
  if (license.expiration_date) {
    expirationInfo = `Expires: ${formatDate(license.expiration_date)}`;
  }
  
  return [
    `**License: ${license.license_key}**`,
    `Language: ${license.language.toUpperCase()}`,
    `Status: ${status}`,
    `Issued: ${formatDate(license.issue_date)}`,
    expirationInfo,
    license.user_id ? `Assigned to: <@${license.user_id}>` : 'Not assigned',
    license.email ? `Email: ${license.email}` : ''
  ].filter(Boolean).join('\n');
}

module.exports = {
  isAdmin,
  formatDate,
  isLicenseExpired,
  formatLicense
}; 
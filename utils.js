/**
 * Check if a user is an admin
 * @param {string} userId - Discord user ID
 * @param {object} config - Bot configuration
 * @returns {boolean} - True if user is an admin
 */
function isAdmin(userId, config) {
  console.log(`Checking admin status for user ${userId}`, {
    configOwnerId: config.ownerId,
    envOwnerId: process.env.OWNER_ID,
    adminUsers: config.adminUsers
  });
  
  // If user ID matches owner ID, they're an admin
  if (userId === config.ownerId || userId === process.env.OWNER_ID) {
    console.log(`User ${userId} is the owner`);
    return true;
  }
  
  // Check if user is in the admin list
  const isInAdminList = config.adminUsers && config.adminUsers.includes(userId);
  console.log(`User ${userId} is ${isInAdminList ? '' : 'not '}in admin list`);
  return isInAdminList;
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
  
  // Game name mapping
  const gameNames = {
    'fortnite': 'Fortnite',
    'fivem': 'FiveM',
    'gtav': 'GTA V',
    'eft': 'Escape From Tarkov',
    'bo6': 'Black Ops 6',
    'warzone': 'Warzone',
    'cs2': 'Counter-Strike 2',
    // Legacy support for old licenses
    'c#': 'C#',
    'python': 'Python',
    'js': 'JavaScript',
    'c++': 'C++'
  };
  
  // Get game name (with fallback to uppercase if not found)
  const gameName = gameNames[license.language] || license.language.toUpperCase();
  
  return [
    `**License: ${license.license_key}**`,
    `Game: ${gameName}`,
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
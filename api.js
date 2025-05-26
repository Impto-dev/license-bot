const express = require('express');
const cors = require('cors');
const { getLicenseByKey } = require('./database');
const { isLicenseExpired } = require('./utils');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root endpoint for API health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'License Validation API is running'
  });
});

// License validation endpoint
app.post('/api/validate', async (req, res) => {
  try {
    const { licenseKey } = req.body;
    
    // Validate request
    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        error: 'License key is required'
      });
    }
    
    // Get license from database
    const license = await getLicenseByKey(licenseKey.toUpperCase());
    
    // License not found
    if (!license) {
      return res.status(404).json({
        success: false,
        error: 'Invalid license key'
      });
    }
    
    // Check license status
    const isExpired = isLicenseExpired(license);
    const isActive = license.is_active === 1;
    
    // Game name mapping
    const gameNames = {
      'fortnite': 'Fortnite',
      'fivem': 'FiveM',
      'gtav': 'GTA V',
      'eft': 'Escape From Tarkov',
      'bo6': 'Black Ops 6',
      'warzone': 'Warzone',
      'cs2': 'Counter-Strike 2',
      // Legacy support
      'c#': 'C#',
      'python': 'Python',
      'js': 'JavaScript',
      'c++': 'C++'
    };
    
    // Format response
    const gameName = gameNames[license.language] || license.language.toUpperCase();
    
    // Build response
    const response = {
      success: true,
      license: {
        key: license.license_key,
        game: gameName,
        gameCode: license.language,
        isValid: isActive && !isExpired,
        isActive: isActive,
        isExpired: isExpired,
        userId: license.user_id || null,
        userName: license.user_name || null,
        email: license.email || null,
        issueDate: license.issue_date ? new Date(license.issue_date * 1000).toISOString() : null,
        expirationDate: license.expiration_date ? new Date(license.expiration_date * 1000).toISOString() : null
      }
    };
    
    return res.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`License Validation API running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down API server...');
  server.close(() => {
    console.log('API server closed');
    process.exit(0);
  });
});

module.exports = { app, server }; 
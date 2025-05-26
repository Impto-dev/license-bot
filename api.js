const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { getLicenseByKey } = require('./database');
const { isLicenseExpired } = require('./utils');
require('dotenv').config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create Express app
const app = express();
const PORT = process.env.API_PORT || 3000;

// Remove x-powered-by header
app.disable('x-powered-by');

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Setup request logging with Morgan
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' })
}));
app.use(morgan('dev'));

// Middleware
app.use(express.json());
app.use(cors());

// Add security headers
app.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error processing request: ${err.message}`, {
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

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
    
    // Log request (without sensitive data)
    logger.info('License validation request', {
      ip: req.ip,
      hasLicenseKey: !!licenseKey
    });
    
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
      logger.info('Invalid license key attempt', {
        ip: req.ip,
        licenseKey: licenseKey.substring(0, 4) + '***' // Log only first part for security
      });
      
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
    
    // Log successful validation
    logger.info('License validation successful', {
      ip: req.ip,
      licenseKey: license.license_key.substring(0, 4) + '***',
      game: gameName,
      isValid: isActive && !isExpired
    });
    
    return res.json(response);
  } catch (error) {
    logger.error('License validation error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`License Validation API running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down API server...');
  server.close(() => {
    logger.info('API server closed');
    process.exit(0);
  });
});

module.exports = { app, server }; 
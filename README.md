# Discord License Manager Bot

A comprehensive Discord bot for managing software licenses for various games (Fortnite, FiveM, GTA V, etc.) with REST API integration, analytics dashboard, and C# client integration.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Command Usage](#command-usage)
  - [Basic Commands](#basic-commands)
  - [License Management](#license-management)
  - [Advanced Features](#advanced-features)
- [API Documentation](#api-documentation)
- [Analytics Dashboard](#analytics-dashboard)
- [C# Integration](#c-integration)
- [Security Features](#security-features)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development Plan](#development-plan)

## ✨ Features

### Core Functionality
- **License Generation**: Create unique, secure license keys with custom prefixes
- **Game Categories**: Support for various games (Fortnite, FiveM, GTA V, etc.)
- **Flexible Durations**: Preset license durations from 1 day to lifetime
- **User Assignment**: Assign licenses to Discord users
- **Verification**: Verify license validity with detailed information

### Advanced Features
- **Bulk Operations**: Generate multiple licenses at once with customization options
- **Renewal System**: Extend or renew licenses with comprehensive renewal history
- **REST API**: External validation and integration capabilities
- **Analytics Dashboard**: Visualize license data with filtering and real-time charts
- **Admin Configuration**: In-Discord bot configuration management
- **Security**: Rate limiting, request logging, and database backups

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/discord-license-manager.git
   cd discord-license-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   BOT_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_discord_server_id
   API_PORT=3000
   DASHBOARD_PORT=3001
   DASHBOARD_TOKEN=your_dashboard_access_token
   ```

4. Set up the database and deploy commands:
   ```bash
   node setup.js
   node deploy-commands.js
   ```

5. Start the bot:
   ```bash
   node index.js
   ```

## ⚙️ Configuration

The bot configuration is stored in `config.json` and can be modified using the `/config` command or by directly editing the file:

```json
{
  "prefix": "!",
  "adminUsers": ["user_id_1", "user_id_2"],
  "adminRoles": ["role_id_1", "role_id_2"],
  "allowedChannels": ["channel_id_1", "channel_id_2"]
}
```

Use the `/config` command for real-time configuration changes:
- `/config set admin @user` - Add a user as admin
- `/config remove admin @user` - Remove admin privileges
- `/config list admins` - Show all admin users and roles

## 💬 Command Usage

### Basic Commands

#### Help Command
View all available commands and their descriptions:
```
/help [command]
```

#### License Creation
Create a new license with specified parameters:
```
/create game:<game> duration:<duration> [email:<email>]
```
Example:
```
/create game:fortnite duration:month_1 email:user@example.com
```

#### License Verification
Check if a license is valid and view its details:
```
/verify key:<license_key>
```

### License Management

#### Assign License
Assign a license to a Discord user:
```
/assign key:<license_key> user:<@user>
```

#### Revoke License
Revoke a license from a user:
```
/revoke key:<license_key>
```

#### Delete License
Permanently delete a license from the database:
```
/delete key:<license_key>
```

#### List Licenses
List all licenses for a specific user or game:
```
/list [user:<@user>] [game:<game>]
```

### Advanced Features

#### Bulk License Generation
Generate multiple licenses at once:
```
/bulk game:<game> duration:<duration> count:<number> [prefix:<prefix>] [email:<domain>]
```
Example:
```
/bulk game:fivem duration:month_3 count:10 prefix:SPECIAL email:company.com
```

#### License Renewal
Renew or extend an existing license:
```
/renew license_key:<key> duration:<duration> [extend:true|false]
```
The `extend` option lets you add time to the existing expiration date rather than creating a new period from the current date.

## 🌐 API Documentation

The REST API runs on port 3000 by default and provides endpoints for license validation and management.

### Endpoints

#### Validate License
```
GET /api/validate/:licenseKey
```
Response:
```json
{
  "valid": true,
  "license": {
    "key": "F-XXXX-XXXX-XXXX",
    "game": "fortnite",
    "expiresAt": "2023-12-31T23:59:59Z",
    "isActive": true
  }
}
```

#### Get License Details
```
GET /api/license/:licenseKey
```
Response includes all license details, including user assignment and metadata.

#### Rate Limiting

The API implements rate limiting (100 requests per 15 minutes) to prevent abuse.

## 📊 Analytics Dashboard

The analytics dashboard provides visual insights into your license data and runs on port 3001 by default.

### Features

- **Overview**: Total licenses, active percentage, and recent activity
- **Game Distribution**: Visualize licenses by game category
- **License Trends**: Track license creation over time
- **User Analytics**: Monitor top users and their license usage
- **License Management**: Search, filter, and view detailed license information

### Access

Access the dashboard at `http://your-server:3001/?token=your_dashboard_token`

## 🔄 C# Integration

The project includes C# integration components for easy incorporation into desktop applications.

### LicenseValidator Library

The `LicenseValidator.cs` library provides methods for:
- License validation
- User authentication
- License activation/deactivation

### Sample Implementation

```csharp
using LicenseValidator;

// Create validator instance
var validator = new LicenseValidator("https://your-api-url.com");

// Validate a license
bool isValid = await validator.ValidateLicense("LICENSE-KEY");

// Get license details
var details = await validator.GetLicenseDetails("LICENSE-KEY");
```

## 🔒 Security Features

### Rate Limiting
Protection against brute force attacks and API abuse with express-rate-limit.

### Comprehensive Logging
- **Request Logging**: HTTP requests logged with Morgan
- **Application Logging**: Structured logging with Winston
- **Audit Trail**: License operations logged for accountability

### Database Backup System
- **Scheduled Backups**: Automatic database backups
- **Rotation System**: Maintains multiple backup versions
- **Validation**: Integrity checks on backup files

### API Security
- Secure headers with Helmet
- CORS protection
- Input validation and sanitization

## 🧪 Testing

The project includes comprehensive tests for all functionality:

### Running Tests

```bash
cd test
npm test
```

### Test Coverage

- **Unit Tests**: Individual components and functions
- **Integration Tests**: Command workflows and API interactions
- **End-to-End Tests**: Complete user journeys
- **Performance Tests**: API load testing and database performance

## 📁 Project Structure

```
discord-license-manager/
├── commands/              # Discord bot commands
│   ├── create.js          # License creation command
│   ├── verify.js          # License verification
│   ├── bulk.js            # Bulk license generation
│   ├── renew.js           # License renewal system
│   └── ...                # Other command files
├── test/                  # Test files
│   ├── bulk-operations.test.js
│   ├── renewal-system.test.js
│   └── ...                # Other test files
├── data/                  # Database and data files
├── backup/                # Database backups
├── views/                 # Dashboard view templates
├── public/                # Static assets for dashboard
├── index.js               # Main bot file
├── api.js                 # REST API implementation
├── dashboard.js           # Analytics dashboard
├── database.js            # Database operations
├── utils.js               # Utility functions
├── command-helper.js      # Command utilities
└── deploy-commands.js     # Command deployment script
```

## 📝 Development Plan

This project was developed in 10 phases:

1. ✅ **Initial Setup and Core Structure**
2. ✅ **License Generation and Basic Commands**
3. ✅ **User Management and License Assignment**
4. ✅ **Discord Bot Integration**
5. ✅ **Duration System and Game Categories**
6. ✅ **REST API Implementation**
7. ✅ **C# Integration**
8. ✅ **Enhanced Administration**
9. ✅ **Security and Robustness**
10. ✅ **Advanced Features and Deployment**

See the full development plan in `plan.md`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Discord.js](https://discord.js.org/) for the Discord bot framework
- [Express](https://expressjs.com/) for the REST API
- [SQLite](https://www.sqlite.org/) for the database
- [Chart.js](https://www.chartjs.org/) for dashboard visualizations
- [Jest](https://jestjs.io/) for testing framework 
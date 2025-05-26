# 📁 Project Structure

This page provides an overview of the Discord License Manager Bot codebase organization, explaining key directories and files.

## Directory Structure

The project follows a modular, component-based structure for maintainability and scalability:

```
discord-license-manager/
├── commands/              # Discord bot commands
│   ├── admin/             # Admin-only commands
│   │   ├── create.js      # License creation command
│   │   ├── bulk.js        # Bulk license generation
│   │   ├── config.js      # Configuration management
│   │   └── ...            # Other admin commands
│   ├── mod/               # Moderator commands
│   │   ├── assign.js      # License assignment
│   │   ├── revoke.js      # License revocation
│   │   └── ...            # Other mod commands
│   └── user/              # Regular user commands
│       ├── verify.js      # License verification
│       ├── redeem.js      # License redemption
│       ├── list.js        # List licenses
│       └── help.js        # Help command
├── api/                   # REST API implementation
│   ├── routes/            # API route definitions
│   │   ├── license.js     # License endpoints
│   │   ├── stats.js       # Statistics endpoints
│   │   └── webhook.js     # Webhook configuration
│   ├── middleware/        # API middleware
│   │   ├── auth.js        # Authentication middleware
│   │   ├── rateLimit.js   # Rate limiting
│   │   └── validate.js    # Request validation
│   └── index.js           # API initialization
├── dashboard/             # Analytics dashboard
│   ├── components/        # React components
│   ├── pages/             # Dashboard pages
│   ├── public/            # Static assets
│   └── index.js           # Dashboard initialization
├── services/              # Core business logic
│   ├── licenseService.js  # License management
│   ├── userService.js     # User management
│   ├── configService.js   # Configuration handling
│   └── analyticsService.js # Data analytics
├── database/              # Database operations
│   ├── models/            # Data models
│   ├── migrations/        # Database migrations
│   ├── seeds/             # Seed data
│   └── index.js           # Database initialization
├── utils/                 # Utility functions
│   ├── licenseGenerator.js # License key generation
│   ├── formatters.js      # Data formatting utilities
│   ├── logger.js          # Logging functionality
│   └── validators.js      # Input validation
├── test/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── api/               # API tests
│   ├── commands/          # Command tests
│   └── mocks/             # Test mocks and fixtures
├── data/                  # Data storage
│   ├── licenses.db        # SQLite database
│   └── backups/           # Database backups
├── docs/                  # Documentation
│   ├── api/               # API documentation
│   └── guides/            # User guides
├── scripts/               # Utility scripts
│   ├── deploy-commands.js # Command deployment
│   ├── setup.js           # Initial setup
│   └── backup.js          # Backup script
├── .env                   # Environment variables
├── .env.example           # Example env file
├── config.json            # Bot configuration
├── index.js               # Main entry point
├── api.js                 # API server setup
├── dashboard.js           # Dashboard server setup
├── package.json           # Dependencies
└── README.md              # Project readme
```

## Key Files

### Core Files

- **index.js**: Main bot entry point and initialization
- **api.js**: REST API server setup and configuration
- **dashboard.js**: Analytics dashboard server
- **config.json**: Bot configuration settings
- **.env**: Environment variables and secrets

### Command Structure

Each command file follows a consistent structure:

```javascript
// commands/admin/create.js
module.exports = {
  name: 'create',
  description: 'Create a new license',
  options: [
    {
      name: 'game',
      description: 'Game to create license for',
      type: 3, // STRING
      required: true,
      choices: [/* game choices */]
    },
    {
      name: 'duration',
      description: 'License duration',
      type: 3, // STRING
      required: true,
      choices: [/* duration choices */]
    },
    // more options...
  ],
  permissions: ['ADMINISTRATOR'],
  async execute(interaction) {
    // Command implementation
  }
};
```

### Service Layer

Services contain core business logic:

```javascript
// services/licenseService.js
class LicenseService {
  constructor(database) {
    this.db = database;
  }
  
  async createLicense(game, duration, email) {
    // Implementation
  }
  
  async verifyLicense(key) {
    // Implementation
  }
  
  // More methods...
}

module.exports = new LicenseService(require('../database'));
```

### Database Models

Models define data structures:

```javascript
// database/models/License.js
class License {
  constructor(data) {
    this.id = data.id;
    this.key = data.key;
    this.game = data.game;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.isActive = data.isActive;
    this.userId = data.userId;
    this.email = data.email;
  }
  
  // Methods...
}

module.exports = License;
```

## Component Relationships

### Command Flow

Commands follow this typical flow:

1. User initiates a command in Discord
2. Command handler validates input and permissions
3. Command calls appropriate service methods
4. Service interacts with database
5. Results return to command handler
6. Command responds to user

### API Flow

API requests follow this flow:

1. Request hits an endpoint
2. Middleware handles authentication and validation
3. Route handler calls appropriate service methods
4. Service interacts with database
5. Route handler formats and returns response

## Development Patterns

### Dependency Injection

The project uses a simple dependency injection pattern:

```javascript
// Factory function for creating service with dependencies
function createLicenseService(database, logger) {
  return {
    async createLicense(game, duration) {
      logger.info(`Creating license for ${game}`);
      return database.insertLicense(/* ... */);
    }
    // Other methods...
  };
}

// Usage
const database = require('./database');
const logger = require('./utils/logger');
const licenseService = createLicenseService(database, logger);
```

### Command Registration

Commands are registered dynamically:

```javascript
// deploy-commands.js
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];
const commandDirs = ['admin', 'mod', 'user'];

// Load all command files
for (const dir of commandDirs) {
  const commandPath = path.join(__dirname, 'commands', dir);
  const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = require(path.join(commandPath, file));
    commands.push(command);
  }
}

// Register with Discord API
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands.map(cmd => ({ 
    name: cmd.name, 
    description: cmd.description,
    options: cmd.options
  })) }
);
```

## Configuration

The bot uses layered configuration:

1. **Environment Variables** (.env): Sensitive data and deployment-specific settings
2. **Config File** (config.json): General bot settings that can be modified
3. **Database Configuration**: Settings that can be changed at runtime

## Extending the Project

### Adding New Commands

1. Create a new command file in the appropriate directory
2. Define the command structure (name, description, options)
3. Implement the execute method
4. Run deploy-commands.js to register the new command

### Adding API Endpoints

1. Create a new route file in api/routes/
2. Define the endpoints and handlers
3. Register the routes in api/index.js

### Adding Dashboard Features

1. Create new React components in dashboard/components/
2. Add new pages if needed
3. Update the dashboard navigation

## Best Practices

- Keep command handlers thin, with business logic in services
- Use consistent error handling patterns
- Follow the principle of separation of concerns
- Use meaningful variable and function names
- Document complex functions and components
- Write tests for new functionality 
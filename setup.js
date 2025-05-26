const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Read existing .env file or create a new one
let envVars = {
  DISCORD_TOKEN: 'your_discord_bot_token_here',
  CLIENT_ID: 'your_application_id_here',
  PREFIX: '!',
  OWNER_ID: '',
  ADMIN_USERS: ''
};

try {
  if (fs.existsSync(envPath)) {
    // Read existing .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse existing environment variables
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });
  }
} catch (error) {
  console.error('Error reading existing .env file:', error.message);
  // Continue with default values
}

console.log('\n=== License Manager Bot Setup ===\n');

// Get Discord bot token
rl.question(`Enter your Discord bot token (press Enter to keep current token): `, (token) => {
  if (token && token.trim() !== '') {
    envVars.DISCORD_TOKEN = token.trim();
  }
  
  // Get Discord application ID (for slash commands)
  rl.question(`Enter your Discord application ID (press Enter to keep current ID): `, (clientId) => {
    if (clientId && clientId.trim() !== '') {
      envVars.CLIENT_ID = clientId.trim();
    }
  
    // Get command prefix
    rl.question(`Enter command prefix (currently "${envVars.PREFIX}"): `, (prefix) => {
      if (prefix && prefix.trim() !== '') {
        envVars.PREFIX = prefix.trim();
      }
      
      // Get owner ID
      console.log('\nIMPORTANT: The owner ID grants full admin access to the bot.');
      console.log('To get your Discord User ID:');
      console.log('1. Enable Developer Mode in Discord (User Settings > Advanced)');
      console.log('2. Right-click on your username and select "Copy ID"');
      
      rl.question(`Enter your Discord user ID for owner privileges: `, (ownerId) => {
        if (ownerId && ownerId.trim() !== '') {
          envVars.OWNER_ID = ownerId.trim();
        }
        
        // Get admin users
        console.log('\nYou can add additional admin users (comma-separated Discord user IDs)');
        console.log('Example: 123456789012345678,987654321098765432');
        
        rl.question(`Enter additional admin user IDs (comma-separated): `, (adminIds) => {
          if (adminIds && adminIds.trim() !== '') {
            envVars.ADMIN_USERS = adminIds.trim();
          }
          
          // Save to .env file
          let envContent = '# Discord Bot Configuration\n';
          
          // Add each environment variable
          for (const [key, value] of Object.entries(envVars)) {
            envContent += `${key}=${value}\n`;
          }
          
          fs.writeFileSync(envPath, envContent);
          
          console.log('\nConfiguration saved to .env file!');
          
          if (!envVars.OWNER_ID) {
            console.log('\nWARNING: No owner ID set. You won\'t be able to use admin commands.');
          }
          
          console.log('\nTo register slash commands, run: npm run deploy');
          console.log('To start the bot, run: npm start');
          
          rl.close();
        });
      });
    });
  });
}); 
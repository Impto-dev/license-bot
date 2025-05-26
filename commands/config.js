const { SlashCommandBuilder } = require('discord.js');
const { isAdmin } = require('../utils');
const { createResponseHandler } = require('../command-helper');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Settings that can be viewed and modified
const SETTINGS = {
  PREFIX: {
    name: 'Command Prefix',
    description: 'The prefix used for text commands (e.g., !help)',
    type: 'string',
    env: 'PREFIX'
  },
  ADMIN_USERS: {
    name: 'Admin Users',
    description: 'Discord IDs of users with admin privileges (comma-separated)',
    type: 'array',
    env: 'ADMIN_USERS'
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View or update bot configuration')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View current configuration settings'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Update a configuration setting')
        .addStringOption(option =>
          option.setName('setting')
            .setDescription('The setting to update')
            .setRequired(true)
            .addChoices(
              { name: 'Prefix', value: 'PREFIX' },
              { name: 'Admin Users', value: 'ADMIN_USERS' }
            ))
        .addStringOption(option =>
          option.setName('value')
            .setDescription('The new value for the setting')
            .setRequired(true))),

  async execute(interaction) {
    try {
      const handler = createResponseHandler(interaction, true);
      
      // Check if user has admin privileges
      if (!isAdmin(handler.getUser().id, interaction.client.config)) {
        return await handler.ephemeralReply('You do not have permission to use this command.');
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'view') {
        // Show current configuration
        const configInfo = formatConfigInfo(interaction.client.config);
        return await handler.reply(configInfo);
      } 
      else if (subcommand === 'set') {
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');
        
        if (!SETTINGS[setting]) {
          return await handler.ephemeralReply('Invalid setting specified.');
        }

        // Update the setting
        const result = await updateSetting(setting, value, interaction.client);
        
        if (result.success) {
          return await handler.reply(`✅ Successfully updated ${SETTINGS[setting].name}: ${result.displayValue}`);
        } else {
          return await handler.ephemeralReply(`❌ Failed to update setting: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error in config command:', error);
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply('An error occurred while processing the command.');
      } else if (!interaction.replied) {
        await interaction.reply({ content: 'An error occurred while processing the command.', flags: 64 });
      }
    }
  },

  // For backwards compatibility with prefix commands
  async executeMessage(message, args) {
    const handler = createResponseHandler(message, false);
    
    // Check if user has admin privileges
    if (!isAdmin(message.author.id, message.client.config)) {
      return await handler.reply('You do not have permission to use this command.');
    }

    // Parse the command: !config view or !config set <setting> <value>
    if (args.length === 0 || args[0] === 'view') {
      // Show current configuration
      const configInfo = formatConfigInfo(message.client.config);
      return await handler.reply(configInfo);
    } 
    else if (args[0] === 'set' && args.length >= 3) {
      const setting = args[1].toUpperCase();
      const value = args.slice(2).join(' ');
      
      if (!SETTINGS[setting]) {
        return await handler.reply('Invalid setting specified. Valid settings: ' + 
          Object.keys(SETTINGS).join(', '));
      }

      // Update the setting
      const result = await updateSetting(setting, value, message.client);
      
      if (result.success) {
        return await handler.reply(`✅ Successfully updated ${SETTINGS[setting].name}: ${result.displayValue}`);
      } else {
        return await handler.reply(`❌ Failed to update setting: ${result.error}`);
      }
    } 
    else {
      const validSettings = Object.keys(SETTINGS).join(', ');
      return await handler.reply(
        `Usage:\n` +
        `\`!config view\` - View current settings\n` +
        `\`!config set <setting> <value>\` - Update a setting\n\n` +
        `Valid settings: ${validSettings}`
      );
    }
  }
};

/**
 * Format configuration information for display
 * @param {object} config - Bot configuration object
 * @returns {string} - Formatted configuration information
 */
function formatConfigInfo(config) {
  const lines = ['**Current Configuration:**'];
  
  // Format each setting
  if (SETTINGS.PREFIX) {
    lines.push(`**Command Prefix:** \`${config.prefix}\``);
  }
  
  if (SETTINGS.ADMIN_USERS) {
    const admins = config.adminUsers || [];
    const adminUsersList = admins.length > 0 
      ? admins.map(id => `<@${id}>`).join(', ') 
      : 'None';
    
    lines.push(`**Admin Users:** ${adminUsersList}`);
  }
  
  return lines.join('\n');
}

/**
 * Update a configuration setting
 * @param {string} setting - Setting key
 * @param {string} value - New value
 * @param {object} client - Discord client
 * @returns {object} - Result object with success flag and details
 */
async function updateSetting(setting, value, client) {
  try {
    // Handle based on setting type
    switch (setting) {
      case 'PREFIX': {
        // Update prefix (must be 1-5 characters)
        if (!value || value.length > 5) {
          return { success: false, error: 'Prefix must be 1-5 characters.' };
        }
        
        // Update in-memory config
        client.config.prefix = value;
        
        return { 
          success: true, 
          displayValue: `\`${value}\`` 
        };
      }
      
      case 'ADMIN_USERS': {
        // Parse user IDs (comma or space separated)
        let userIds = value.split(/[\s,]+/).filter(Boolean);
        
        // Validate all IDs are numeric
        for (const id of userIds) {
          if (!/^\d+$/.test(id.trim())) {
            return { success: false, error: `Invalid user ID: ${id}` };
          }
        }
        
        // Clean and deduplicate
        userIds = [...new Set(userIds.map(id => id.trim()))];
        
        // Update in-memory config
        client.config.adminUsers = userIds;
        
        // Format for display
        const displayValue = userIds.length > 0 
          ? userIds.map(id => `<@${id}>`).join(', ') 
          : 'None';
        
        return { 
          success: true, 
          displayValue 
        };
      }
      
      default:
        return { success: false, error: 'Unknown setting.' };
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    return { success: false, error: 'Internal error while updating setting.' };
  }
} 
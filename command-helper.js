/**
 * Helper functions for command handling with both prefix and slash commands
 */

/**
 * Creates a unified response handler for both slash commands and message commands
 * @param {Object} interaction - Discord.js interaction or message object
 * @param {boolean} isSlash - Whether this is a slash command interaction
 * @returns {Object} - Response handler
 */
function createResponseHandler(interaction, isSlash = false) {
  // Do NOT automatically defer - let the command decide when to defer
  
  return {
    /**
     * Reply to the command
     * @param {string|Object} content - Reply content
     * @param {Object} options - Additional options for slash commands
     */
    reply: async (content, options = {}) => {
      try {
        if (isSlash) {
          // For slash commands
          const replyOptions = typeof content === 'string' 
            ? { content, ...options } 
            : content;
          
          if (interaction.deferred && !interaction.replied) {
            await interaction.editReply(replyOptions);
          } else if (!interaction.replied) {
            await interaction.reply(replyOptions);
          } else {
            await interaction.followUp(replyOptions);
          }
        } else {
          // For prefix commands
          await interaction.reply(content);
        }
      } catch (error) {
        console.error('Error replying to interaction:', error);
      }
    },
    
    /**
     * Send an ephemeral reply (only visible to the command user)
     * @param {string} content - Reply content
     */
    ephemeralReply: async (content) => {
      try {
        if (isSlash) {
          // For slash commands - use flags instead of ephemeral option
          const replyOptions = {
            content,
            flags: 64 // Ephemeral flag (64)
          };
          
          if (interaction.deferred && !interaction.replied) {
            await interaction.editReply(replyOptions);
          } else if (!interaction.replied) {
            await interaction.reply(replyOptions);
          } else {
            await interaction.followUp(replyOptions);
          }
        } else {
          // For prefix commands (can't be ephemeral, so just regular reply)
          await interaction.reply(content);
        }
      } catch (error) {
        console.error('Error sending ephemeral reply:', error);
      }
    },
    
    /**
     * Get the user who initiated the command
     * @returns {Object} - Discord user object
     */
    getUser: () => {
      return isSlash ? interaction.user : interaction.author;
    },
    
    /**
     * Defer the response to indicate the bot is processing
     * Only call this once and early in the command execution
     */
    defer: async (ephemeral = false) => {
      if (isSlash && !interaction.deferred && !interaction.replied) {
        try {
          const options = ephemeral ? { flags: 64 } : {};
          await interaction.deferReply(options);
        } catch (error) {
          console.error('Error deferring reply:', error);
          // If we get an Unknown interaction error, the interaction is no longer valid
          // Continue with command execution, but our replies won't work
        }
      }
    }
  };
}

module.exports = {
  createResponseHandler
}; 
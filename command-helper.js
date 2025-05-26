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
  return {
    /**
     * Reply to the command
     * @param {string|Object} content - Reply content
     * @param {Object} options - Additional options for slash commands
     */
    reply: async (content, options = {}) => {
      if (isSlash) {
        // For slash commands
        const replyOptions = typeof content === 'string' 
          ? { content, ...options } 
          : content;
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply(replyOptions);
        } else {
          await interaction.followUp(replyOptions);
        }
      } else {
        // For prefix commands
        await interaction.reply(content);
      }
    },
    
    /**
     * Send an ephemeral reply (only visible to the command user)
     * @param {string} content - Reply content
     */
    ephemeralReply: async (content) => {
      if (isSlash) {
        // For slash commands - use flags instead of ephemeral option
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            content,
            flags: 64 // Ephemeral flag (64)
          });
        } else {
          await interaction.followUp({ 
            content,
            flags: 64 // Ephemeral flag (64)
          });
        }
      } else {
        // For prefix commands (can't be ephemeral, so just regular reply)
        await interaction.reply(content);
      }
    },
    
    /**
     * Get the user who initiated the command
     * @returns {Object} - Discord user object
     */
    getUser: () => {
      return isSlash ? interaction.user : interaction.author;
    }
  };
}

module.exports = {
  createResponseHandler
}; 
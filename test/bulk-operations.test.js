const { addLicense, getLicenseByKey } = require('../database');
const { generateLicenseKey } = require('../database');
const bulkCommand = require('../commands/bulk');

// Mock dependencies
jest.mock('../database', () => ({
  addLicense: jest.fn(),
  getLicenseByKey: jest.fn(),
  generateLicenseKey: jest.fn()
}));

// Mock Discord interaction
const createMockInteraction = (options = {}) => {
  return {
    options: {
      getString: jest.fn((key) => options[key] || ''),
      getInteger: jest.fn((key) => options[key] || 1),
      getBoolean: jest.fn((key) => options[key] || false),
    },
    deferReply: jest.fn(),
    editReply: jest.fn(),
    client: {
      config: {
        adminUsers: ['admin123']
      }
    },
    user: {
      id: 'admin123',
      username: 'TestAdmin'
    }
  };
};

// Mock Discord message
const createMockMessage = (args = []) => {
  return {
    channel: {
      send: jest.fn()
    },
    reply: jest.fn(),
    author: {
      id: 'admin123',
      username: 'TestAdmin'
    },
    client: {
      config: {
        adminUsers: ['admin123']
      }
    }
  };
};

describe('Bulk License Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock license key generation
    generateLicenseKey.mockImplementation((prefix) => `${prefix}MOCK-KEY-${Math.random().toString(36).substring(2, 10)}`);
    
    // Mock license addition
    addLicense.mockImplementation((data) => Promise.resolve(Math.floor(Math.random() * 1000)));
  });
  
  describe('Slash Command', () => {
    it('should generate multiple licenses in bulk', async () => {
      // Mock interaction with options
      const interaction = createMockInteraction({
        game: 'fortnite',
        duration: 'month_1',
        count: 5,
        prefix: 'TEST',
        email: 'test.com'
      });
      
      // Execute the command
      await bulkCommand.execute(interaction);
      
      // Verify license generation
      expect(addLicense).toHaveBeenCalledTimes(5);
      expect(generateLicenseKey).toHaveBeenCalledTimes(5);
      
      // Verify response sent
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
    
    it('should require admin privileges', async () => {
      // Mock interaction with non-admin user
      const interaction = createMockInteraction({
        game: 'fortnite',
        duration: 'month_1',
        count: 5
      });
      
      // Change user ID to non-admin
      interaction.user.id = 'regular123';
      
      // Execute the command
      await bulkCommand.execute(interaction);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
    });
    
    it('should validate game input', async () => {
      // Mock interaction with invalid game
      const interaction = createMockInteraction({
        game: 'invalid_game',
        duration: 'month_1',
        count: 5
      });
      
      // Execute the command
      await bulkCommand.execute(interaction);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
    });
    
    it('should validate duration input', async () => {
      // Mock interaction with invalid duration
      const interaction = createMockInteraction({
        game: 'fortnite',
        duration: 'invalid_duration',
        count: 5
      });
      
      // Execute the command
      await bulkCommand.execute(interaction);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
    });
    
    it('should handle error during license generation', async () => {
      // Mock interaction
      const interaction = createMockInteraction({
        game: 'fortnite',
        duration: 'month_1',
        count: 5
      });
      
      // Mock an error during license addition
      addLicense.mockImplementation(() => Promise.reject(new Error('Database error')));
      
      // Execute the command
      await bulkCommand.execute(interaction);
      
      // Verify error response
      expect(interaction.editReply).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
  });
  
  describe('Message Command', () => {
    it('should generate multiple licenses in bulk', async () => {
      // Mock message with arguments
      const message = createMockMessage(['fortnite', 'month_1', '5', 'TEST', 'test.com']);
      
      // Execute the command
      await bulkCommand.executeMessage(message, ['fortnite', 'month_1', '5', 'TEST', 'test.com']);
      
      // Verify license generation
      expect(addLicense).toHaveBeenCalledTimes(5);
      expect(generateLicenseKey).toHaveBeenCalledTimes(5);
      
      // Verify response sent
      expect(message.channel.send).toHaveBeenCalled();
    });
    
    it('should require admin privileges', async () => {
      // Mock message with non-admin user
      const message = createMockMessage(['fortnite', 'month_1', '5']);
      
      // Change user ID to non-admin
      message.author.id = 'regular123';
      
      // Execute the command
      await bulkCommand.executeMessage(message, ['fortnite', 'month_1', '5']);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
    });
    
    it('should validate required arguments', async () => {
      // Mock message with insufficient arguments
      const message = createMockMessage(['fortnite']);
      
      // Execute the command
      await bulkCommand.executeMessage(message, ['fortnite']);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
      
      // Verify usage instructions sent
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });
    
    it('should validate count parameter', async () => {
      // Mock message with invalid count
      const message = createMockMessage(['fortnite', 'month_1', 'invalid']);
      
      // Execute the command
      await bulkCommand.executeMessage(message, ['fortnite', 'month_1', 'invalid']);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
      
      // Verify error message sent
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Count must be a number'));
    });
    
    it('should validate game parameter', async () => {
      // Mock message with invalid game
      const message = createMockMessage(['invalid_game', 'month_1', '5']);
      
      // Execute the command
      await bulkCommand.executeMessage(message, ['invalid_game', 'month_1', '5']);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
      
      // Verify error message sent
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Invalid game'));
    });
    
    it('should validate duration parameter', async () => {
      // Mock message with invalid duration
      const message = createMockMessage(['fortnite', 'invalid_duration', '5']);
      
      // Execute the command
      await bulkCommand.executeMessage(message, ['fortnite', 'invalid_duration', '5']);
      
      // Verify no licenses were generated
      expect(addLicense).not.toHaveBeenCalled();
      expect(generateLicenseKey).not.toHaveBeenCalled();
      
      // Verify error message sent
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Invalid duration'));
    });
  });
}); 
const { getLicenseByKey, addLicense, deleteLicense } = require('../database');
const renewCommand = require('../commands/renew');

// Mock dependencies
jest.mock('../database', () => ({
  getLicenseByKey: jest.fn(),
  addLicense: jest.fn(),
  deleteLicense: jest.fn()
}));

// Mock Discord interaction
const createMockInteraction = (options = {}) => {
  return {
    options: {
      getString: jest.fn((key) => options[key] || ''),
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

describe('License Renewal Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset current time mock
    jest.spyOn(Date, 'now').mockImplementation(() => 1620000000000); // May 3, 2021
    
    // Mock license retrieval
    getLicenseByKey.mockImplementation((key) => {
      if (key === 'NONEXISTENT-KEY') {
        return Promise.resolve(null);
      }
      
      return Promise.resolve({
        id: 123,
        license_key: key,
        user_id: 'user456',
        user_name: 'TestUser',
        email: 'test@example.com',
        language: 'fortnite',
        issue_date: 1600000000, // Sept 13, 2020
        expiration_date: 1630000000, // Aug 26, 2021
        is_active: 1,
        metadata: JSON.stringify({
          created_by: 'admin123'
        })
      });
    });
    
    // Mock license operations
    addLicense.mockImplementation((data) => Promise.resolve(456));
    deleteLicense.mockImplementation((id) => Promise.resolve(1));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Slash Command', () => {
    it('should renew an existing license with a new duration', async () => {
      // Mock interaction with options
      const interaction = createMockInteraction({
        license_key: 'TEST-LICENSE-KEY',
        duration: 'month_1',
        extend: false
      });
      
      // Execute the command
      await renewCommand.execute(interaction);
      
      // Verify license operations
      expect(getLicenseByKey).toHaveBeenCalledWith('TEST-LICENSE-KEY');
      expect(deleteLicense).toHaveBeenCalledWith(123);
      expect(addLicense).toHaveBeenCalled();
      
      // Verify the license data contains renewal information
      const newLicenseData = addLicense.mock.calls[0][0];
      expect(newLicenseData.license_key).toBe('TEST-LICENSE-KEY');
      
      // Parse metadata to check renewal history
      const metadata = JSON.parse(newLicenseData.metadata);
      expect(metadata.renewalHistory).toBeDefined();
      expect(metadata.renewalHistory.length).toBe(1);
      expect(metadata.renewalHistory[0].duration).toBe('1 Month');
      
      // Verify response sent
      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalled();
    });
    
    it('should extend from the current expiration date when requested', async () => {
      // Mock interaction with extend option
      const interaction = createMockInteraction({
        license_key: 'TEST-LICENSE-KEY',
        duration: 'month_1',
        extend: true
      });
      
      // Execute the command
      await renewCommand.execute(interaction);
      
      // Verify license operations
      expect(deleteLicense).toHaveBeenCalledWith(123);
      expect(addLicense).toHaveBeenCalled();
      
      // Get the new expiration date from the added license
      const newLicenseData = addLicense.mock.calls[0][0];
      
      // The new expiration should be the original expiration + 30 days in seconds
      const expectedExpiration = 1630000000 + (30 * 86400);
      expect(newLicenseData.expiration_date).toBe(expectedExpiration);
    });
    
    it('should require admin privileges', async () => {
      // Mock interaction with non-admin user
      const interaction = createMockInteraction({
        license_key: 'TEST-LICENSE-KEY',
        duration: 'month_1'
      });
      
      // Change user ID to non-admin
      interaction.user.id = 'regular123';
      
      // Execute the command
      await renewCommand.execute(interaction);
      
      // Verify no license operations were performed
      expect(getLicenseByKey).not.toHaveBeenCalled();
      expect(deleteLicense).not.toHaveBeenCalled();
      expect(addLicense).not.toHaveBeenCalled();
    });
    
    it('should handle non-existent license keys', async () => {
      // Mock interaction with non-existent license
      const interaction = createMockInteraction({
        license_key: 'NONEXISTENT-KEY',
        duration: 'month_1'
      });
      
      // Execute the command
      await renewCommand.execute(interaction);
      
      // Verify license lookup but no modification
      expect(getLicenseByKey).toHaveBeenCalledWith('NONEXISTENT-KEY');
      expect(deleteLicense).not.toHaveBeenCalled();
      expect(addLicense).not.toHaveBeenCalled();
      
      // Verify error response
      expect(interaction.editReply).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });
    
    it('should handle license renewal with lifetime duration', async () => {
      // Mock interaction with lifetime duration
      const interaction = createMockInteraction({
        license_key: 'TEST-LICENSE-KEY',
        duration: 'lifetime'
      });
      
      // Execute the command
      await renewCommand.execute(interaction);
      
      // Verify license operations
      expect(deleteLicense).toHaveBeenCalledWith(123);
      expect(addLicense).toHaveBeenCalled();
      
      // Get the new expiration date from the added license
      const newLicenseData = addLicense.mock.calls[0][0];
      
      // Lifetime licenses should have null expiration
      expect(newLicenseData.expiration_date).toBeNull();
    });
    
    it('should handle errors during renewal', async () => {
      // Mock interaction
      const interaction = createMockInteraction({
        license_key: 'TEST-LICENSE-KEY',
        duration: 'month_1'
      });
      
      // Mock an error during license deletion
      deleteLicense.mockImplementation(() => Promise.reject(new Error('Database error')));
      
      // Execute the command
      await renewCommand.execute(interaction);
      
      // Verify error response
      expect(interaction.editReply).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
  });
  
  describe('Message Command', () => {
    it('should renew an existing license', async () => {
      // Mock message with arguments
      const message = createMockMessage();
      const args = ['TEST-LICENSE-KEY', 'month_1'];
      
      // Execute the command
      await renewCommand.executeMessage(message, args);
      
      // Verify license operations
      expect(getLicenseByKey).toHaveBeenCalledWith('TEST-LICENSE-KEY');
      expect(deleteLicense).toHaveBeenCalledWith(123);
      expect(addLicense).toHaveBeenCalled();
      
      // Verify response sent
      expect(message.reply).toHaveBeenCalled();
    });
    
    it('should extend from current expiration when specified', async () => {
      // Mock message with extend argument
      const message = createMockMessage();
      const args = ['TEST-LICENSE-KEY', 'month_1', 'true'];
      
      // Execute the command
      await renewCommand.executeMessage(message, args);
      
      // Get the new expiration date from the added license
      const newLicenseData = addLicense.mock.calls[0][0];
      
      // The new expiration should be the original expiration + 30 days in seconds
      const expectedExpiration = 1630000000 + (30 * 86400);
      expect(newLicenseData.expiration_date).toBe(expectedExpiration);
    });
    
    it('should require admin privileges', async () => {
      // Mock message with non-admin user
      const message = createMockMessage();
      message.author.id = 'regular123';
      const args = ['TEST-LICENSE-KEY', 'month_1'];
      
      // Execute the command
      await renewCommand.executeMessage(message, args);
      
      // Verify no license operations were performed
      expect(getLicenseByKey).not.toHaveBeenCalled();
      expect(deleteLicense).not.toHaveBeenCalled();
      expect(addLicense).not.toHaveBeenCalled();
    });
    
    it('should validate required arguments', async () => {
      // Mock message with insufficient arguments
      const message = createMockMessage();
      const args = ['TEST-LICENSE-KEY'];
      
      // Execute the command
      await renewCommand.executeMessage(message, args);
      
      // Verify no license operations were performed
      expect(getLicenseByKey).not.toHaveBeenCalled();
      expect(deleteLicense).not.toHaveBeenCalled();
      expect(addLicense).not.toHaveBeenCalled();
      
      // Verify usage instructions sent
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });
    
    it('should validate duration parameter', async () => {
      // Mock message with invalid duration
      const message = createMockMessage();
      const args = ['TEST-LICENSE-KEY', 'invalid_duration'];
      
      // Execute the command
      await renewCommand.executeMessage(message, args);
      
      // Verify no license operations were performed
      expect(getLicenseByKey).not.toHaveBeenCalled();
      expect(deleteLicense).not.toHaveBeenCalled();
      expect(addLicense).not.toHaveBeenCalled();
      
      // Verify error message sent
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Invalid duration'));
    });
  });
}); 
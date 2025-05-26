/**
 * Config loading test
 * Tests the loading of configuration from environment variables
 */

// Mock environment variables
process.env.DISCORD_TOKEN = 'test-token';
process.env.CLIENT_ID = 'test-client-id';
process.env.PREFIX = '!';
process.env.OWNER_ID = '123456789';
process.env.ADMIN_USERS = '123456789,987654321';
process.env.API_PORT = '3000';

describe('Configuration Loading', () => {
  let config;
  
  beforeEach(() => {
    // Clear require cache to ensure fresh config loading
    jest.resetModules();
  });

  test('should load configuration from environment variables', () => {
    // Load configuration
    const { token, prefix, ownerId, adminUsers } = require('../index').getConfig();
    
    // Check that configuration was loaded correctly
    expect(token).toBe('test-token');
    expect(prefix).toBe('!');
    expect(ownerId).toBe('123456789');
    expect(adminUsers).toContain('123456789');
    expect(adminUsers).toContain('987654321');
    expect(adminUsers.length).toBe(2);
  });

  test('should use default values when environment variables are missing', () => {
    // Remove environment variables
    delete process.env.PREFIX;
    
    // Load configuration
    const { prefix } = require('../index').getConfig();
    
    // Check that default values were used
    expect(prefix).toBe('!'); // Default prefix value
  });

  test('should parse admin users correctly', () => {
    // Set environment variables
    process.env.ADMIN_USERS = '123,456, 789';
    
    // Load configuration
    const { adminUsers } = require('../index').getConfig();
    
    // Check that admin users were parsed correctly
    expect(adminUsers).toContain('123');
    expect(adminUsers).toContain('456');
    expect(adminUsers).toContain('789');
    expect(adminUsers.length).toBe(3);
  });

  test('should handle empty admin users', () => {
    // Set environment variables
    process.env.ADMIN_USERS = '';
    
    // Load configuration
    const { adminUsers } = require('../index').getConfig();
    
    // Check that admin users is an empty array
    expect(adminUsers).toEqual([]);
  });
}); 
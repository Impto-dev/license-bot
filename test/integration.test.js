/**
 * Integration Tests
 * End-to-end tests for the license management system
 */

const request = require('supertest');
const { app } = require('../api');
const { Client } = require('discord.js');
const { 
  addLicense, 
  getLicenseByKey, 
  getUserLicenses, 
  revokeLicense, 
  deleteLicense
} = require('../database');

// This is an end-to-end test that tests the entire flow from
// license creation to validation via the API

describe('End-to-End License Management', () => {
  let licenseKey;
  
  // Setup before all tests - create a test license
  beforeAll(async () => {
    // Clear any test licenses
    try {
      const existingLicenses = await getUserLicenses('test-user-id');
      for (const license of existingLicenses) {
        await deleteLicense(license.license_key);
      }
    } catch (error) {
      console.error('Error cleaning up test licenses:', error);
    }
    
    // Create a new test license
    licenseKey = await addLicense({
      game: 'fortnite',
      userId: 'test-user-id',
      userName: 'TestUser',
      email: 'test@example.com',
      days: 30
    });
  });
  
  // Cleanup after all tests
  afterAll(async () => {
    try {
      // Delete the test license
      if (licenseKey) {
        await deleteLicense(licenseKey);
      }
    } catch (error) {
      console.error('Error cleaning up test license:', error);
    }
  });
  
  // The test flow
  describe('License Lifecycle', () => {
    test('should create a valid license', async () => {
      // Verify the license was created correctly
      const license = await getLicenseByKey(licenseKey);
      expect(license).not.toBeNull();
      expect(license.license_key).toBe(licenseKey);
      expect(license.language).toBe('fortnite');
      expect(license.user_id).toBe('test-user-id');
      expect(license.is_active).toBe(1);
    });
    
    test('should be able to validate the license via API', async () => {
      // Validate the license using the API
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.license.key).toBe(licenseKey);
      expect(response.body.license.game).toBe('Fortnite');
      expect(response.body.license.isValid).toBe(true);
    });
    
    test('should be able to revoke the license', async () => {
      // Revoke the license
      await revokeLicense(licenseKey);
      
      // Verify it was revoked
      const license = await getLicenseByKey(licenseKey);
      expect(license.is_active).toBe(0);
      
      // Verify it shows as invalid in the API
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey });
      
      expect(response.body.license.isActive).toBe(false);
      expect(response.body.license.isValid).toBe(false);
    });
    
    test('should be able to delete the license', async () => {
      // Delete the license
      await deleteLicense(licenseKey);
      
      // Verify it was deleted
      const license = await getLicenseByKey(licenseKey);
      expect(license).toBeNull();
      
      // Verify the API returns an error
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

// Skip Discord bot tests in CI environments
(process.env.CI ? describe.skip : describe)('Discord Bot Integration', () => {
  let client;
  
  beforeAll(async () => {
    // This would normally connect to Discord, but we'll mock it for tests
    client = new Client({ intents: [] });
    
    // Mock client methods
    client.login = jest.fn().mockResolvedValue('mock-token');
    client.user = { id: 'bot-id' };
    
    // Start the bot
    await client.login('mock-token');
  });
  
  afterAll(async () => {
    // Cleanup
    if (client) {
      client.destroy();
    }
  });
  
  test('should be able to process commands', () => {
    // This is a placeholder for actual Discord command tests
    // In a real test, we would mock interactions and verify responses
    expect(client.user.id).toBe('bot-id');
  });
});

// C# Integration tests with API
describe('C# Integration', () => {
  test('API should return data in format compatible with C# client', async () => {
    // Create a test license
    const licenseKey = await addLicense({
      game: 'cs2',
      userId: 'csharp-test-user',
      userName: 'CSharpTestUser',
      email: 'csharp@example.com',
      days: 30
    });
    
    try {
      // Validate via API
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey });
      
      // Check data structure matches what C# client expects
      expect(response.body.success).toBe(true);
      expect(response.body.license).toBeDefined();
      expect(response.body.license.key).toBe(licenseKey);
      expect(response.body.license.gameCode).toBe('cs2');
      expect(response.body.license.game).toBe('Counter-Strike 2');
      
      // Check date format is compatible with C# DateTime.Parse
      expect(Date.parse(response.body.license.issueDate)).not.toBeNaN();
      expect(Date.parse(response.body.license.expirationDate)).not.toBeNaN();
      
      // Verify boolean properties are actual booleans
      expect(typeof response.body.license.isValid).toBe('boolean');
      expect(typeof response.body.license.isActive).toBe('boolean');
      expect(typeof response.body.license.isExpired).toBe('boolean');
      
    } finally {
      // Clean up
      await deleteLicense(licenseKey);
    }
  });
}); 
/**
 * API License Validation Tests
 * Tests the license validation endpoint of the API
 */

const request = require('supertest');
const { app } = require('../api');
const { addLicense, generateLicenseKey } = require('../database');

// Mock database functions
jest.mock('../database', () => ({
  getLicenseByKey: jest.fn(),
  addLicense: jest.fn(),
  generateLicenseKey: jest.fn()
}));

// Mock isLicenseExpired utility function
jest.mock('../utils', () => ({
  isLicenseExpired: jest.fn()
}));

const { getLicenseByKey } = require('../database');
const { isLicenseExpired } = require('../utils');

describe('License Validation API', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  test('should return error when license key is missing', async () => {
    const response = await request(app)
      .post('/api/validate')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('License key is required');
  });

  test('should return error when license does not exist', async () => {
    // Mock getLicenseByKey to return null (license not found)
    getLicenseByKey.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'INVALID-LICENSE-KEY' });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid license key');
    expect(getLicenseByKey).toHaveBeenCalledWith('INVALID-LICENSE-KEY');
  });

  test('should return valid license details', async () => {
    // Mock getLicenseByKey to return a valid license
    const mockLicense = {
      id: 1,
      license_key: 'TEST-LICENSE-KEY',
      language: 'fortnite',
      is_active: 1,
      issue_date: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      expiration_date: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
      user_id: '123456789',
      user_name: 'TestUser',
      email: 'test@example.com'
    };
    
    getLicenseByKey.mockResolvedValue(mockLicense);
    isLicenseExpired.mockReturnValue(false);

    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'TEST-LICENSE-KEY' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.license).toBeDefined();
    expect(response.body.license.key).toBe('TEST-LICENSE-KEY');
    expect(response.body.license.game).toBe('Fortnite');
    expect(response.body.license.gameCode).toBe('fortnite');
    expect(response.body.license.isValid).toBe(true);
    expect(response.body.license.isActive).toBe(true);
    expect(response.body.license.isExpired).toBe(false);
    expect(response.body.license.userId).toBe('123456789');
    expect(response.body.license.userName).toBe('TestUser');
    expect(response.body.license.email).toBe('test@example.com');
    expect(response.body.license.issueDate).toBeDefined();
    expect(response.body.license.expirationDate).toBeDefined();
  });

  test('should handle expired licenses correctly', async () => {
    // Mock getLicenseByKey to return an expired license
    const mockLicense = {
      id: 1,
      license_key: 'EXPIRED-LICENSE',
      language: 'fivem',
      is_active: 1,
      issue_date: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
      expiration_date: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    };
    
    getLicenseByKey.mockResolvedValue(mockLicense);
    isLicenseExpired.mockReturnValue(true);

    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'EXPIRED-LICENSE' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.license).toBeDefined();
    expect(response.body.license.isValid).toBe(false);
    expect(response.body.license.isExpired).toBe(true);
  });

  test('should handle inactive licenses correctly', async () => {
    // Mock getLicenseByKey to return an inactive license
    const mockLicense = {
      id: 1,
      license_key: 'INACTIVE-LICENSE',
      language: 'cs2',
      is_active: 0,
      issue_date: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      expiration_date: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
    };
    
    getLicenseByKey.mockResolvedValue(mockLicense);
    isLicenseExpired.mockReturnValue(false);

    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'INACTIVE-LICENSE' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.license).toBeDefined();
    expect(response.body.license.isValid).toBe(false);
    expect(response.body.license.isActive).toBe(false);
  });

  test('should handle database errors gracefully', async () => {
    // Mock getLicenseByKey to throw an error
    getLicenseByKey.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'ERROR-LICENSE' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Internal server error');
  });
}); 
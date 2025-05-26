/**
 * C# Integration Tests
 * Tests the API endpoints used by the C# client integration
 */

const request = require('supertest');
const { app } = require('../api');
const { addLicense, getLicenseByKey } = require('../database');
const { isLicenseExpired } = require('../utils');

// Mock database functions
jest.mock('../database', () => ({
  getLicenseByKey: jest.fn(),
  addLicense: jest.fn()
}));

// Mock utility functions
jest.mock('../utils', () => ({
  isLicenseExpired: jest.fn()
}));

describe('C# Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('License Validation for C# Client', () => {
    test('should validate license with full details for C# client', async () => {
      // Create a mock license with all properties that C# client expects
      const mockLicense = {
        id: 1,
        license_key: 'FTEST-1234-5678-9ABC',
        language: 'fortnite',
        is_active: 1,
        issue_date: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        expiration_date: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        user_id: '123456789',
        user_name: 'TestUser',
        email: 'test@example.com'
      };
      
      // Setup mocks
      getLicenseByKey.mockResolvedValue(mockLicense);
      isLicenseExpired.mockReturnValue(false);

      // Perform the request as the C# client would
      const response = await request(app)
        .post('/api/validate')
        .set('Content-Type', 'application/json')
        .send({ licenseKey: 'FTEST-1234-5678-9ABC' });

      // Verify the response structure matches what C# client expects
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.license).toBeDefined();
      
      // Check all properties used by the C# LicenseInfo class
      expect(response.body.license.key).toBe('FTEST-1234-5678-9ABC');
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

    test('should properly format dates for C# client consumption', async () => {
      // Create a license with known dates
      const now = new Date();
      const issueDate = Math.floor(now.getTime() / 1000) - 86400;
      const expirationDate = Math.floor(now.getTime() / 1000) + 86400 * 30;
      
      const mockLicense = {
        id: 1,
        license_key: 'FTEST-DATE-FORMAT-TEST',
        language: 'fortnite',
        is_active: 1,
        issue_date: issueDate,
        expiration_date: expirationDate,
      };
      
      // Setup mocks
      getLicenseByKey.mockResolvedValue(mockLicense);
      isLicenseExpired.mockReturnValue(false);

      // Perform the request
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey: 'FTEST-DATE-FORMAT-TEST' });

      // Verify date formatting
      expect(response.body.license.issueDate).toBeDefined();
      expect(response.body.license.expirationDate).toBeDefined();
      
      // Verify the dates are in ISO format (what C# DateTime.Parse can handle)
      expect(new Date(response.body.license.issueDate).getTime()).toBe(issueDate * 1000);
      expect(new Date(response.body.license.expirationDate).getTime()).toBe(expirationDate * 1000);
    });

    test('should handle lifetime licenses (null expiration) for C# client', async () => {
      // Create a license with no expiration date (lifetime)
      const mockLicense = {
        id: 1,
        license_key: 'FTEST-LIFETIME-LICENSE',
        language: 'fortnite',
        is_active: 1,
        issue_date: Math.floor(Date.now() / 1000) - 86400,
        expiration_date: null, // Null expiration date indicates lifetime license
      };
      
      // Setup mocks
      getLicenseByKey.mockResolvedValue(mockLicense);
      isLicenseExpired.mockReturnValue(false);

      // Perform the request
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey: 'FTEST-LIFETIME-LICENSE' });

      // Verify response for lifetime license
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.license.expirationDate).toBeNull();
      expect(response.body.license.isValid).toBe(true);
      expect(response.body.license.isExpired).toBe(false);
    });

    test('should handle error responses correctly for C# client', async () => {
      // Setup mock to simulate an error
      getLicenseByKey.mockRejectedValue(new Error('Database error'));

      // Perform the request
      const response = await request(app)
        .post('/api/validate')
        .send({ licenseKey: 'ERROR-LICENSE' });

      // Verify the error response structure for C# client
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.license).toBeUndefined();
    });
  });
}); 
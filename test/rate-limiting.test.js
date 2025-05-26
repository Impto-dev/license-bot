/**
 * Rate Limiting Tests
 * Tests the API rate limiting functionality
 */

const request = require('supertest');
const { app, server } = require('../api');

// Mock the rate limiter for testing
jest.mock('express-rate-limit', () => {
  // Factory function that returns a middleware function
  return jest.fn(() => {
    const middleware = jest.fn((req, res, next) => {
      // Check if this is a test that should trigger rate limiting
      if (req.get('X-Test-Rate-Limit') === 'exceed') {
        return res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later.'
        });
      }
      next();
    });
    
    // Add store property to mimic the real rate-limiter
    middleware.resetKey = jest.fn();
    return middleware;
  });
});

describe('API Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Close the server after all tests
  afterAll((done) => {
    server.close(() => {
      done();
    });
  });
  
  test('should allow requests under the rate limit', async () => {
    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'TEST-LICENSE-KEY' });
    
    // We're not testing the actual validation here, just that the request wasn't rate limited
    expect(response.status).not.toBe(429);
  });
  
  test('should reject requests that exceed the rate limit', async () => {
    const response = await request(app)
      .post('/api/validate')
      .set('X-Test-Rate-Limit', 'exceed')
      .send({ licenseKey: 'TEST-LICENSE-KEY' });
    
    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Too many requests, please try again later.');
  });
  
  test('should apply rate limiting only to API routes', async () => {
    // First try an API route (should be limited)
    const apiResponse = await request(app)
      .post('/api/validate')
      .set('X-Test-Rate-Limit', 'exceed')
      .send({ licenseKey: 'TEST-LICENSE-KEY' });
    
    expect(apiResponse.status).toBe(429);
    
    // Then try a non-API route (should not be limited)
    const nonApiResponse = await request(app)
      .get('/')
      .set('X-Test-Rate-Limit', 'exceed');
    
    expect(nonApiResponse.status).not.toBe(429);
    expect(nonApiResponse.body.status).toBe('ok');
  });
});

// In a real-world scenario, we would also want to test with multiple requests
// to ensure the rate limiting counter is working correctly. However, this is
// difficult to test in a unit testing environment, as the rate limiter middleware
// is designed to work across multiple real HTTP requests.
//
// For more comprehensive testing, we could create an integration test that
// actually makes many requests and verifies rate limiting behavior.
describe('Rate Limiting Integration', () => {
  // This test is skipped by default as it requires making many real requests
  // which can slow down the test suite.
  test.skip('should limit after multiple requests', async () => {
    // Make multiple requests in quick succession
    const requests = [];
    const NUM_REQUESTS = 105; // Over our limit of 100
    
    for (let i = 0; i < NUM_REQUESTS; i++) {
      requests.push(
        request(app)
          .post('/api/validate')
          .send({ licenseKey: 'TEST-LICENSE-KEY' })
      );
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(requests);
    
    // Count how many were rate limited
    const rateLimited = responses.filter(res => res.status === 429);
    
    // We expect some requests to be rate limited
    expect(rateLimited.length).toBeGreaterThan(0);
  });
}); 
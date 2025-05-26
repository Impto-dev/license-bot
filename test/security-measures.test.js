/**
 * Security Measures Tests
 * Tests the security features of the API
 */

const request = require('supertest');
const { app } = require('../api');

describe('API Security Headers', () => {
  test('should set security headers on responses', async () => {
    const response = await request(app).get('/');
    
    // Check that security headers are set
    expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
    expect(response.headers).toHaveProperty('content-security-policy');
  });
  
  test('should set correct content security policy', async () => {
    const response = await request(app).get('/');
    
    // Check content security policy
    expect(response.headers['content-security-policy']).toBe("default-src 'self'");
  });
});

describe('Input Validation', () => {
  test('should reject invalid JSON', async () => {
    const response = await request(app)
      .post('/api/validate')
      .set('Content-Type', 'application/json')
      .send('{"licenseKey": "TEST-LICENSE-KEY"'); // Invalid JSON (missing closing brace)
    
    expect(response.status).toBe(400);
  });
  
  test('should sanitize license key input', async () => {
    // Create a mock license key with potential SQL injection
    const maliciousKey = "TEST-LICENSE-KEY'; DROP TABLE licenses; --";
    
    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: maliciousKey });
    
    // Since we're mocking the database, we're just checking that
    // the API correctly handles the input without throwing errors
    expect(response.status).not.toBe(500);
  });
  
  test('should handle extremely long license keys', async () => {
    // Create a very long license key
    const longKey = 'X'.repeat(10000);
    
    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: longKey });
    
    // The API should handle this gracefully
    expect(response.status).not.toBe(500);
  });
});

describe('Error Handling', () => {
  test('should return appropriate error for invalid endpoint', async () => {
    const response = await request(app).get('/non-existent-endpoint');
    
    expect(response.status).toBe(404);
  });
  
  test('should not expose error details in production', async () => {
    // Temporarily set NODE_ENV to production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    // Force an error
    const response = await request(app)
      .post('/api/validate')
      .set('Content-Type', 'text/plain') // Invalid content type
      .send('Not JSON');
    
    // Reset NODE_ENV
    process.env.NODE_ENV = originalEnv;
    
    // Check that error response doesn't include sensitive details
    expect(response.status).toBe(400);
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('trace');
    
    // Should have a generic error message
    expect(response.body).toHaveProperty('error');
  });
});

describe('CORS Configuration', () => {
  test('should allow CORS requests', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'https://example.com');
    
    // Check CORS headers
    expect(response.headers).toHaveProperty('access-control-allow-origin');
  });
});

describe('Rate Limiting', () => {
  test('should have rate limiting headers', async () => {
    const response = await request(app)
      .post('/api/validate')
      .send({ licenseKey: 'TEST-LICENSE-KEY' });
    
    // Check for rate limit headers (actual values may vary based on implementation)
    expect(response.headers).toHaveProperty('ratelimit-limit');
    expect(response.headers).toHaveProperty('ratelimit-remaining');
  });
});

describe('Information Leakage Prevention', () => {
  test('should not expose server information', async () => {
    const response = await request(app).get('/');
    
    // Server header should not reveal details
    expect(response.headers).not.toHaveProperty('x-powered-by');
  });
  
  test('should not include sensitive data in error responses', async () => {
    const response = await request(app)
      .post('/api/validate')
      .send({}); // Missing licenseKey
    
    // Check that error doesn't leak sensitive info
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('code');
    expect(response.body).not.toHaveProperty('line');
    expect(response.body).not.toHaveProperty('fileName');
  });
}); 
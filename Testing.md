# 🧪 Testing

The Discord License Manager Bot includes comprehensive testing to ensure reliability, security, and performance. This page explains the testing approach and provides guidance for running tests.

## Testing Overview

The project uses a multi-layered testing approach:

- **Unit Tests**: Isolated tests for individual components and functions
- **Integration Tests**: Tests for interactions between components
- **End-to-End Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing for scalability

## Test Setup

### Prerequisites

- Node.js (v16.9.0 or higher)
- npm (comes with Node.js)
- All dependencies installed (`npm install`)
- Test database configured (separate from production)

### Test Configuration

Create a `.env.test` file in the root directory with test-specific settings:

```
BOT_TOKEN=your_test_bot_token
CLIENT_ID=your_test_client_id
GUILD_ID=your_test_server_id
API_PORT=3001
DASHBOARD_PORT=3002
DASHBOARD_TOKEN=test_dashboard_token
DATABASE_PATH=./data/test.db
```

This ensures tests run in an isolated environment without affecting production data.

## Running Tests

### All Tests

Run the complete test suite:

```bash
npm test
```

### Specific Test Categories

Run specific categories of tests:

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only API tests
npm run test:api

# Run only bot command tests
npm run test:commands
```

### Single Test File

Run a specific test file:

```bash
npx jest test/unit/license-generator.test.js
```

### Watch Mode

Run tests in watch mode (useful during development):

```bash
npm run test:watch
```

## Test Types

### Unit Tests

Unit tests focus on testing individual functions and components in isolation:

```javascript
// test/unit/license-generator.test.js
describe('License Generator', () => {
  test('generates valid license keys', () => {
    const key = generateLicenseKey('fortnite', 'XXXX-XXXX-XXXX');
    expect(key).toMatch(/^F-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
  
  test('rejects invalid game types', () => {
    expect(() => generateLicenseKey('invalid-game', 'XXXX-XXXX-XXXX'))
      .toThrow('Invalid game type');
  });
});
```

### Integration Tests

Integration tests verify that different components work together correctly:

```javascript
// test/integration/license-creation.test.js
describe('License Creation Flow', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  test('creates and stores a license', async () => {
    const license = await licenseService.createLicense('fortnite', 'month_1');
    const retrieved = await licenseService.getLicense(license.key);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved.game).toBe('fortnite');
    expect(retrieved.isActive).toBe(true);
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
});
```

### Command Tests

Command tests verify that Discord commands function correctly:

```javascript
// test/commands/create-command.test.js
describe('Create Command', () => {
  beforeEach(() => {
    mockInteraction = createMockInteraction({
      commandName: 'create',
      options: {
        getString: jest.fn(),
        getUser: jest.fn()
      }
    });
  });
  
  test('creates a license with valid parameters', async () => {
    mockInteraction.options.getString.mockImplementation((name) => {
      if (name === 'game') return 'fortnite';
      if (name === 'duration') return 'month_1';
      return null;
    });
    
    await createCommand.execute(mockInteraction);
    
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.stringContaining('License created successfully')
    );
  });
});
```

### API Tests

API tests verify the REST API endpoints:

```javascript
// test/api/license-validation.test.js
describe('License Validation API', () => {
  beforeAll(async () => {
    server = await startTestServer();
    await setupTestLicenses();
  });
  
  test('validates a valid license', async () => {
    const response = await request(server)
      .get('/api/validate/F-TEST-1234-ABCD')
      .set('Authorization', 'Bearer test_api_key');
    
    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
  });
  
  afterAll(async () => {
    await stopTestServer(server);
  });
});
```

### Performance Tests

Performance tests evaluate the system under load:

```javascript
// test/performance/api-load.test.js
describe('API Load Testing', () => {
  test('handles multiple concurrent requests', async () => {
    const server = await startTestServer();
    const results = await Promise.all(
      Array(100).fill().map(() => 
        request(server)
          .get('/api/validate/F-TEST-1234-ABCD')
          .set('Authorization', 'Bearer test_api_key')
      )
    );
    
    const successCount = results.filter(r => r.status === 200).length;
    expect(successCount).toBe(100);
    
    await stopTestServer(server);
  }, 30000); // Longer timeout for performance tests
});
```

## Mocking

The test suite uses various mocking techniques:

### Discord.js Mocking

```javascript
// test/mocks/discord.js
const mockClient = {
  user: { id: 'bot-user-id' },
  guilds: {
    cache: new Map([
      ['guild-id', { name: 'Test Guild' }]
    ])
  }
};

const mockInteraction = {
  reply: jest.fn(),
  editReply: jest.fn(),
  deferReply: jest.fn(),
  options: {
    getString: jest.fn(),
    getUser: jest.fn(),
    getInteger: jest.fn()
  },
  user: { id: 'user-id', username: 'TestUser' },
  guild: { id: 'guild-id' }
};
```

### Database Mocking

```javascript
// test/mocks/database.js
const mockDatabase = {
  getLicense: jest.fn(),
  createLicense: jest.fn(),
  updateLicense: jest.fn(),
  deleteLicense: jest.fn()
};

// Mock implementation
mockDatabase.getLicense.mockImplementation((key) => {
  if (key === 'F-TEST-1234-ABCD') {
    return {
      key,
      game: 'fortnite',
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000)
    };
  }
  return null;
});
```

## Test Coverage

The project aims for high test coverage across all components:

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage` directory, showing:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Continuous Integration

The project uses GitHub Actions for continuous integration:

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Test Best Practices

- Write tests before or alongside code (TDD approach)
- Keep tests independent and idempotent
- Use descriptive test names that explain the expected behavior
- Test both happy paths and error cases
- Clean up test data after tests run
- Avoid testing implementation details; focus on behavior

## Troubleshooting Tests

### Common Issues

#### Tests Are Slow

- Use mocks instead of real dependencies
- Run only the tests you need during development
- Optimize database operations in tests

#### Flaky Tests

- Check for time-dependent code
- Ensure proper cleanup between tests
- Avoid dependencies between tests
- Use more specific assertions

#### Discord API Issues

- Use mocks for Discord interactions
- Create a dedicated test server for API integration tests
- Use lower rate limits in test environment 
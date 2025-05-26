# License Manager - Test Suite

This folder contains automated tests for the Discord License Manager Bot and its components.

## Test Structure

The tests are organized by functionality:

- **config.test.js**: Tests configuration loading
- **api-validation.test.js**: Tests the API license validation endpoint
- **cs-integration.test.js**: Tests the C# client integration with the API
- **integration.test.js**: End-to-end tests for the complete system

## Running Tests

To run the tests, you need to have Node.js and npm installed. Then:

1. Navigate to the test directory:
   ```
   cd test
   ```

2. Install the test dependencies:
   ```
   npm install
   ```

3. Run the tests:
   ```
   npm test
   ```

## Running Specific Tests

You can run specific test files:

```
npx jest config.test.js
```

Or use the watch mode to automatically re-run tests when files change:

```
npm run test:watch
```

## Code Coverage

To generate code coverage reports:

```
npm run test:coverage
```

This will create a `coverage` directory with detailed reports on test coverage.

## Writing New Tests

When adding new tests:

1. Create a file with the `.test.js` extension
2. Follow the existing test patterns
3. Use descriptive test names
4. Group related tests using `describe` blocks
5. Use appropriate setup/teardown with `beforeEach`, `afterEach`, `beforeAll`, `afterAll`

## Mocking

The tests use Jest's mocking capabilities to isolate components:

- Database functions are mocked to prevent actual database operations
- Discord.js is mocked to prevent actual Discord API calls
- API endpoints are tested using supertest

Example of mocking a database function:

```javascript
jest.mock('../database', () => ({
  getLicenseByKey: jest.fn()
}));

const { getLicenseByKey } = require('../database');
getLicenseByKey.mockResolvedValue({ /* mock license data */ });
```

## Integration Tests

Integration tests verify that different components work together correctly:

- API and database integration
- Discord bot and database integration
- C# client and API integration

These tests may require additional setup to run properly.

## Prerequisites

- Node.js 16.x or higher
- npm
- Jest
- supertest (for API testing)

## Environment Setup

The tests automatically set up mock environment variables when needed. You don't need to configure a real Discord bot for testing. 
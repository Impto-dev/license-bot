# 🌐 API Documentation

The Discord License Manager Bot includes a REST API that allows external applications to interact with the license system. This page documents the available endpoints and their usage.

## API Overview

- Base URL: `http://your-server:3000/api`
- Authentication: API key required in headers
- Rate Limiting: 100 requests per 15 minutes by default (configurable)
- Response Format: JSON

## Authentication

All API requests require an API key sent in the request headers:

```
Authorization: Bearer your-api-key
```

You can generate and manage API keys using the bot's `/apikey` command:

```
/apikey create [description]
/apikey list
/apikey revoke <key_id>
```

## Endpoints

### License Validation

#### Get License Validity

```
GET /validate/:licenseKey
```

Checks if a license is valid and returns basic information.

**Parameters:**
- `licenseKey`: The license key to validate

**Response Example:**
```json
{
  "valid": true,
  "license": {
    "key": "F-XXXX-XXXX-XXXX",
    "game": "fortnite",
    "expiresAt": "2023-12-31T23:59:59Z",
    "isActive": true
  }
}
```

### License Management

#### Get License Details

```
GET /license/:licenseKey
```

Returns detailed information about a specific license.

**Parameters:**
- `licenseKey`: The license key to retrieve

**Response Example:**
```json
{
  "license": {
    "id": "abc123",
    "key": "F-XXXX-XXXX-XXXX",
    "game": "fortnite",
    "createdAt": "2023-01-01T12:00:00Z",
    "expiresAt": "2023-12-31T23:59:59Z",
    "isActive": true,
    "email": "user@example.com",
    "user": {
      "id": "123456789012345678",
      "username": "JohnDoe"
    },
    "history": [
      {
        "action": "created",
        "timestamp": "2023-01-01T12:00:00Z"
      },
      {
        "action": "assigned",
        "timestamp": "2023-01-02T15:30:00Z"
      }
    ]
  }
}
```

#### Create License

```
POST /license
```

Creates a new license.

**Request Body:**
```json
{
  "game": "fortnite",
  "duration": "month_1",
  "email": "user@example.com"
}
```

**Response Example:**
```json
{
  "success": true,
  "license": {
    "id": "def456",
    "key": "F-ABCD-1234-EFGH",
    "game": "fortnite",
    "createdAt": "2023-06-01T10:00:00Z",
    "expiresAt": "2023-07-01T10:00:00Z",
    "isActive": true,
    "email": "user@example.com"
  }
}
```

#### Assign License

```
PUT /license/:licenseKey/assign
```

Assigns a license to a Discord user.

**Parameters:**
- `licenseKey`: The license key to assign

**Request Body:**
```json
{
  "userId": "123456789012345678"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "License assigned successfully"
}
```

#### Revoke License

```
PUT /license/:licenseKey/revoke
```

Revokes a license from its assigned user.

**Parameters:**
- `licenseKey`: The license key to revoke

**Response Example:**
```json
{
  "success": true,
  "message": "License revoked successfully"
}
```

#### Delete License

```
DELETE /license/:licenseKey
```

Permanently deletes a license.

**Parameters:**
- `licenseKey`: The license key to delete

**Response Example:**
```json
{
  "success": true,
  "message": "License deleted successfully"
}
```

### Bulk Operations

#### Bulk Create Licenses

```
POST /licenses/bulk
```

Creates multiple licenses at once.

**Request Body:**
```json
{
  "game": "fivem",
  "duration": "month_3",
  "count": 10,
  "prefix": "SPECIAL",
  "email": "company.com"
}
```

**Response Example:**
```json
{
  "success": true,
  "count": 10,
  "licenses": [
    {
      "key": "FM-SPECIAL-XXXX-XXXX",
      "game": "fivem",
      "expiresAt": "2023-09-01T10:00:00Z"
    },
    // ... more licenses
  ]
}
```

### Statistics

#### Get License Statistics

```
GET /stats
```

Returns license usage statistics.

**Query Parameters:**
- `game` (optional): Filter by game
- `period` (optional): Time period (daily, weekly, monthly, all)

**Response Example:**
```json
{
  "totalLicenses": 150,
  "activeLicenses": 120,
  "byGame": {
    "fortnite": 75,
    "fivem": 45,
    "gtav": 30
  },
  "byDuration": {
    "month_1": 50,
    "month_3": 70,
    "lifetime": 30
  },
  "creationHistory": [
    {
      "date": "2023-01",
      "count": 45
    },
    {
      "date": "2023-02",
      "count": 55
    },
    {
      "date": "2023-03",
      "count": 50
    }
  ]
}
```

## Error Handling

All API endpoints use consistent error formats:

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

Common error codes:
- `INVALID_LICENSE`: The license key is invalid or doesn't exist
- `EXPIRED_LICENSE`: The license has expired
- `UNAUTHORIZED`: Invalid or missing API key
- `FORBIDDEN`: Insufficient permissions for the operation
- `RATE_LIMITED`: Too many requests in the time window
- `BAD_REQUEST`: Invalid request parameters
- `NOT_FOUND`: Requested resource not found
- `INTERNAL_ERROR`: Server-side error

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, clients are limited to 100 requests per 15-minute window. 

When rate-limited, the API returns a 429 Too Many Requests status with headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets

## Webhook Notifications

You can configure webhooks to receive notifications about license events:

```
POST /webhook/configure
```

**Request Body:**
```json
{
  "url": "https://your-server.com/webhook",
  "secret": "your_webhook_secret",
  "events": ["license.created", "license.assigned", "license.expired"]
}
```

Events are sent as HTTP POST requests to your webhook URL with a signature header for verification. 
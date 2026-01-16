import { DocDocument } from '../models';

/**
 * Mock documentation data for development
 * Structure:
 * - Array of documents (md files)
 * - Each document has id + markdown content
 * - Title is extracted from first h1 in content
 * - TOC sections (right sidebar) are extracted from headings
 */
export const MOCK_DOCUMENTS: DocDocument[] = [
  {
    id: 'public-api',
    content: `# eSIM Public API

## Overview

The Public API provides external integration capabilities for eSIM product management, purchasing, and usage tracking. All endpoints require \`ROLE_PUBLIC_API\` authorization.

**Base URL:** \`/api/public/\`

## Authentication

Include your API key or JWT token in the request headers. All endpoints require the \`ROLE_PUBLIC_API\` role.

## Endpoints

### Get Customer Balance Usage

Retrieves aggregated bundle usage across all subscribers for a specific customer.

**Endpoint:**

\`\`\`http
GET /api/public/balance/customer/{customerIdentifier}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`customerIdentifier\` | string | Yes | Unique customer identifier |

**Response:**

\`\`\`json
[
  {
    "id": "bundle_8f14e45f",
    "name": "Premium Europe Bundle",
    "purchasedAt": "2026-01-08T10:30:00Z",
    "startedAt": "2026-01-08T12:00:00Z",
    "expiredAt": "2026-02-07T12:00:00Z",
    "status": "ACTIVE",
    "usages": [
      {
        "type": "DATA",
        "unitType": "GB",
        "total": 10.0,
        "used": 3.5,
        "remaining": 6.5
      }
    ]
  }
]
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Bundle identifier |
| \`name\` | string | Product name |
| \`purchasedAt\` | string | Purchase timestamp (ISO 8601) |
| \`startedAt\` | string | Activation timestamp (ISO 8601) |
| \`expiredAt\` | string | Expiration timestamp (ISO 8601) |
| \`status\` | string | Status: \`ACTIVE\`, \`EXPIRED\`, \`PENDING\` |
| \`usages\` | array | List of usage metrics |
| \`usages[].type\` | string | Usage type: \`DATA\`, \`VOICE\`, \`SMS\` |
| \`usages[].unitType\` | string | Unit: \`GB\`, \`MB\`, \`MINUTES\`, \`COUNT\` |
| \`usages[].total\` | number | Total allowance |
| \`usages[].used\` | number | Amount consumed |
| \`usages[].remaining\` | number | Amount remaining |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |
| 404 | \`NOT_FOUND\` | Customer not found |

---

### Get Subscriber Balance Usage

Retrieves current bundle usage for a specific subscriber by ICCID.

**Endpoint:**

\`\`\`http
GET /api/public/balance/subscriber/{iccId}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`iccId\` | string | Yes | SIM card ICCID |

**Response:**

\`\`\`json
[
  {
    "id": "bundle_2d7428a6",
    "name": "Asia Travel Pack",
    "purchasedAt": "2026-01-10T08:15:00Z",
    "startedAt": "2026-01-10T09:00:00Z",
    "expiredAt": "2026-01-25T09:00:00Z",
    "status": "ACTIVE",
    "usages": [
      {
        "type": "DATA",
        "unitType": "GB",
        "total": 5.0,
        "used": 1.2,
        "remaining": 3.8
      }
    ]
  }
]
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Bundle identifier |
| \`name\` | string | Product name |
| \`purchasedAt\` | string | Purchase timestamp (ISO 8601) |
| \`startedAt\` | string | Activation timestamp (ISO 8601) |
| \`expiredAt\` | string | Expiration timestamp (ISO 8601) |
| \`status\` | string | Status: \`ACTIVE\`, \`EXPIRED\`, \`PENDING\` |
| \`usages\` | array | List of usage metrics |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |
| 404 | \`NOT_FOUND\` | Subscriber not found |

---

### Get Subscriber Purchase History

Retrieves historical bundle purchases for a subscriber.

**Endpoint:**

\`\`\`http
GET /api/public/subscriber/{iccid}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`iccid\` | string | Yes | SIM card ICCID |

**Response:**

\`\`\`json
[
  {
    "id": "bundle_9a3b7c1d",
    "name": "Basic Europe Bundle",
    "purchasedAt": "2025-12-01T14:20:00Z",
    "startedAt": "2025-12-01T15:00:00Z",
    "expiredAt": "2025-12-31T15:00:00Z",
    "status": "EXPIRED",
    "usages": [
      {
        "type": "DATA",
        "unitType": "GB",
        "total": 3.0,
        "used": 3.0,
        "remaining": 0.0
      }
    ]
  }
]
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Bundle identifier |
| \`name\` | string | Product name |
| \`purchasedAt\` | string | Purchase timestamp (ISO 8601) |
| \`startedAt\` | string | Activation timestamp (ISO 8601) |
| \`expiredAt\` | string | Expiration timestamp (ISO 8601) |
| \`status\` | string | Status: \`ACTIVE\`, \`EXPIRED\`, \`PENDING\` |
| \`usages\` | array | List of usage metrics |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |
| 404 | \`NOT_FOUND\` | Subscriber not found |

---

### List Products

Retrieves available eSIM products with optional filtering.

**Endpoint:**

\`\`\`http
GET /api/public/products
\`\`\`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`destination\` | string | No | Filter by destination country or region |
| \`minPrice\` | decimal | No | Minimum price filter (must be >= 0) |
| \`maxPrice\` | decimal | No | Maximum price filter (must be >= 0) |
| \`minData\` | double | No | Minimum data amount in GB (must be >= 0) |

**Response:**

\`\`\`json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Premium Europe Bundle",
    "description": "10GB data for 30 days across 35 European countries",
    "destination": "Europe",
    "price": 29.99,
    "currency": "EUR",
    "usageUnits": [
      {
        "value": 10.0,
        "type": "DATA",
        "unitType": "GB"
      }
    ],
    "validityPeriod": {
      "period": 30,
      "timeUnit": "DAYS"
    }
  }
]
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Product UUID |
| \`name\` | string | Product name |
| \`description\` | string | Product description |
| \`destination\` | string | Coverage region or country |
| \`price\` | decimal | Product price |
| \`currency\` | string | Currency code (ISO 4217) |
| \`usageUnits\` | array | Included usage allowances |
| \`usageUnits[].value\` | number | Allowance amount |
| \`usageUnits[].type\` | string | Usage type: \`DATA\`, \`VOICE\`, \`SMS\` |
| \`usageUnits[].unitType\` | string | Unit: \`GB\`, \`MB\`, \`MINUTES\`, \`COUNT\` |
| \`validityPeriod.period\` | integer | Validity duration |
| \`validityPeriod.timeUnit\` | string | Time unit: \`DAYS\`, \`HOURS\`, \`MONTHS\` |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | \`BAD_REQUEST\` | Invalid filter parameters |
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |

---

### Purchase Product

Creates a new eSIM product purchase for a customer.

**Endpoint:**

\`\`\`http
POST /api/public/purchase/product/{productId}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`productId\` | UUID | Yes | Product identifier |

**Request Body:**

\`\`\`json
{
  "customerEmail": "john.doe@example.com",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "iccid": "89012345678901234567",
  "externalCustomerId": "cust_abc123",
  "paymentStrategy": "STRIPE",
  "externalTransactionId": "pi_3N8xyz123456789",
  "callbackUrl": "https://yourapp.com/webhooks/esim"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`customerEmail\` | string | No | Customer email (max 128 chars) |
| \`customerId\` | UUID | No | Existing customer identifier |
| \`iccid\` | string | No | Specific ICCID to assign |
| \`externalCustomerId\` | string | No | External system customer reference (max 128 chars) |
| \`paymentStrategy\` | string | No | Payment method (max 128 chars) |
| \`externalTransactionId\` | string | No | External payment transaction ID (max 128 chars) |
| \`callbackUrl\` | string | No | Webhook URL for status updates |

**Response:**

\`\`\`json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionId": "660e8400-e29b-41d4-a716-446655440001",
  "transactionStatus": "COMPLETED",
  "redirectUrl": "https://checkout.stripe.com/c/pay/cs_live_abc123",
  "externalTransactionId": "pi_3N8xyz123456789",
  "purchaseId": "770e8400-e29b-41d4-a716-446655440002"
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`customerId\` | UUID | Customer identifier |
| \`transactionId\` | UUID | Internal transaction identifier |
| \`transactionStatus\` | string | Status: \`PENDING\`, \`COMPLETED\`, \`FAILED\` |
| \`redirectUrl\` | string | Payment redirect URL (if applicable) |
| \`externalTransactionId\` | string | External transaction reference |
| \`purchaseId\` | UUID | Purchase identifier for tracking |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | \`BAD_REQUEST\` | Invalid request body |
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |
| 404 | \`NOT_FOUND\` | Product not found |

---

### Get Purchase Details

Retrieves detailed information about a specific purchase.

**Endpoint:**

\`\`\`http
GET /api/public/purchase/{purchaseId}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`purchaseId\` | UUID | Yes | Purchase identifier |

**Response:**

\`\`\`json
{
  "purchaseId": "770e8400-e29b-41d4-a716-446655440002",
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "productName": "Premium Europe Bundle",
  "status": "ACTIVE",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "subscriberId": "880e8400-e29b-41d4-a716-446655440003",
  "iccid": "89012345678901234567",
  "purchasedAt": "2026-01-15T10:30:00Z",
  "startedAt": "2026-01-15T11:00:00Z",
  "expiredAt": "2026-02-14T11:00:00Z",
  "price": 29.99,
  "currency": "EUR",
  "usages": [
    {
      "type": "DATA",
      "unitType": "GB",
      "total": 10.0,
      "used": 0.0,
      "remaining": 10.0
    }
  ],
  "qrCode": "LPA:1$smdp.esim-provider.com$K2-ABC123-XYZ789"
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`purchaseId\` | UUID | Purchase identifier |
| \`productId\` | UUID | Product identifier |
| \`productName\` | string | Product name |
| \`status\` | string | Status: \`ACTIVE\`, \`EXPIRED\`, \`PENDING\` |
| \`customerId\` | UUID | Customer identifier |
| \`subscriberId\` | UUID | Subscriber identifier |
| \`iccid\` | string | SIM card ICCID |
| \`purchasedAt\` | string | Purchase timestamp (ISO 8601) |
| \`startedAt\` | string | Activation timestamp (ISO 8601) |
| \`expiredAt\` | string | Expiration timestamp (ISO 8601) |
| \`price\` | decimal | Purchase price |
| \`currency\` | string | Currency code (ISO 4217) |
| \`usages\` | array | Current usage metrics |
| \`qrCode\` | string | LPA string for eSIM activation |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |
| 404 | \`NOT_FOUND\` | Purchase not found |

---

### Get Subscriber QR Code

Retrieves the QR code image for eSIM activation.

**Endpoint:**

\`\`\`http
GET /api/public/qr/{iccId}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`iccId\` | string | Yes | SIM card ICCID |

**Response:**

- **Content-Type:** \`image/png\`
- **Body:** Binary PNG image data (300x300 pixels)

You can embed this directly in HTML:

\`\`\`html
<img src="https://api.example.com/api/public/qr/89012345678901234567" alt="eSIM QR Code">
\`\`\`

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | \`UNAUTHORIZED\` | Authentication required |
| 403 | \`FORBIDDEN\` | Insufficient permissions |
| 404 | \`NOT_FOUND\` | Subscriber not found |

## Errors

All endpoints return errors in a consistent format:

\`\`\`json
{
  "error": "Not Found",
  "message": "Resource not found"
}
\`\`\`

| Status | Code | Description |
|--------|------|-------------|
| 400 | \`BAD_REQUEST\` | Invalid request parameters or body |
| 401 | \`UNAUTHORIZED\` | Missing or invalid authentication |
| 403 | \`FORBIDDEN\` | Valid auth but insufficient permissions |
| 404 | \`NOT_FOUND\` | Requested resource does not exist |
| 429 | \`RATE_LIMIT_EXCEEDED\` | Too many requests |
| 500 | \`INTERNAL_SERVER_ERROR\` | Unexpected server error |
`
  }
];

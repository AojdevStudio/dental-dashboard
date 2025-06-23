# REST API Specifications

## Overview

This document provides comprehensive specifications for all REST API endpoints in the Dental Dashboard. Each endpoint includes request/response formats, authentication requirements, and example usage.

## Quick Reference

| Resource | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| Auth | POST | `/api/auth/register` | User registration |
| Auth | POST | `/api/auth/callback` | OAuth callback |
| Providers | GET | `/api/providers` | List providers |
| Providers | POST | `/api/providers` | Create provider |
| Metrics | GET | `/api/metrics` | Get dashboard metrics |
| Goals | GET | `/api/goals` | List goals |

## Base Configuration

### Base URL
```
Development: http://localhost:3000/api
Production: https://dental-dashboard.vercel.app/api
```

### Authentication
All endpoints except auth routes require authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Common Headers
```
Content-Type: application/json
Accept: application/json
X-Clinic-ID: <clinic_uuid> (optional, for admin users)
```

### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    totalCount?: number
    totalPages?: number
  }
}
```

## Authentication Endpoints

### Register User
```
POST /api/auth/register-comprehensive
```

Creates a new user account with clinic association.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "clinicName": "Sunshine Dental",
  "clinicAddress": "123 Main St",
  "phoneNumber": "+1234567890",
  "role": "office_manager"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "office_manager"
    },
    "clinic": {
      "id": "clinic_123",
      "name": "Sunshine Dental"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid input data
- `409` - Email already exists

### OAuth Callback
```
GET /api/auth/google/callback?code=<auth_code>
```

Handles OAuth provider callbacks.

**Response (302):**
Redirects to dashboard on success or login with error.

### Get Session
```
GET /api/auth/session
```

Returns current user session.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "clinicId": "clinic_123",
      "role": "office_manager",
      "permissions": ["read:providers", "write:providers"]
    }
  }
}
```

## Provider Management

### List Providers
```
GET /api/providers?page=1&limit=20&sortBy=name&sortOrder=asc&locationId=loc_123&isActive=true
```

Returns paginated list of providers for the authenticated clinic.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `sortBy` (string) - Sort field: name, createdAt, productionYTD
- `sortOrder` (string) - Sort direction: asc, desc
- `locationId` (string) - Filter by location
- `isActive` (boolean) - Filter by active status
- `search` (string) - Search by name or email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prov_123",
      "name": "Dr. Smith",
      "email": "dr.smith@example.com",
      "specialty": "General Dentistry",
      "isActive": true,
      "locations": [
        {
          "id": "loc_123",
          "name": "Main Office"
        }
      ],
      "metrics": {
        "productionYTD": 250000,
        "productionMTD": 25000,
        "activePatients": 150
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 45,
    "totalPages": 3
  }
}
```

### Get Provider
```
GET /api/providers/{providerId}
```

Returns detailed provider information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prov_123",
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "phoneNumber": "+1234567890",
    "specialty": "General Dentistry",
    "licenseNumber": "DDS12345",
    "isActive": true,
    "hireDate": "2020-01-15",
    "biography": "Experienced dentist...",
    "locations": [
      {
        "id": "loc_123",
        "name": "Main Office",
        "isPrimary": true
      }
    ],
    "workSchedule": {
      "monday": { "start": "09:00", "end": "17:00" },
      "tuesday": { "start": "09:00", "end": "17:00" }
    }
  }
}
```

### Create Provider
```
POST /api/providers
```

Creates a new provider.

**Request Body:**
```json
{
  "name": "Dr. Jane Doe",
  "email": "dr.doe@example.com",
  "phoneNumber": "+1234567890",
  "specialty": "Orthodontics",
  "licenseNumber": "DDS67890",
  "hireDate": "2024-01-01",
  "locationIds": ["loc_123", "loc_456"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "prov_456",
    "name": "Dr. Jane Doe",
    "email": "dr.doe@example.com"
  }
}
```

### Update Provider
```
PUT /api/providers/{providerId}
```

Updates provider information.

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "isActive": false,
  "locationIds": ["loc_123"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prov_456",
    "name": "Dr. Jane Smith",
    "isActive": false
  }
}
```

### Provider Locations
```
GET /api/providers/{providerId}/locations
```

Get provider's assigned locations.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "loc_123",
      "name": "Main Office",
      "address": "123 Main St",
      "isPrimary": true,
      "assignedDate": "2024-01-01"
    }
  ]
}
```

### Update Provider Locations
```
POST /api/providers/{providerId}/locations
```

Update provider location assignments.

**Request Body:**
```json
{
  "locationIds": ["loc_123", "loc_789"],
  "primaryLocationId": "loc_123"
}
```

### Provider Performance
```
GET /api/providers/{providerId}/performance?startDate=2024-01-01&endDate=2024-12-31
```

Get provider performance metrics.

**Query Parameters:**
- `startDate` (date) - Start of date range
- `endDate` (date) - End of date range
- `compareToGoals` (boolean) - Include goal comparisons

**Response (200):**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "prov_123",
      "name": "Dr. Smith"
    },
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "metrics": {
      "production": {
        "total": 250000,
        "average": 20833,
        "byMonth": [
          { "month": "2024-01", "amount": 22000 }
        ]
      },
      "patients": {
        "total": 150,
        "new": 45,
        "retention": 0.85
      },
      "appointments": {
        "total": 1200,
        "completed": 1100,
        "cancellationRate": 0.08
      }
    },
    "goals": {
      "production": {
        "target": 300000,
        "achieved": 250000,
        "percentage": 0.83
      }
    }
  }
}
```

## Metrics & Analytics

### Dashboard Metrics
```
GET /api/metrics?period=month&date=2024-01
```

Get aggregated dashboard metrics.

**Query Parameters:**
- `period` (string) - day, week, month, quarter, year
- `date` (date) - Reference date for period
- `clinicId` (string) - For admin users only
- `providerId` (string) - Filter by provider

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "type": "month",
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "financial": {
      "production": 125000,
      "collections": 115000,
      "adjustments": 5000,
      "netProduction": 120000
    },
    "patients": {
      "active": 450,
      "new": 25,
      "recare": 380,
      "recareRate": 0.84
    },
    "appointments": {
      "scheduled": 520,
      "completed": 480,
      "cancelled": 25,
      "noShow": 15,
      "completionRate": 0.92
    },
    "providers": [
      {
        "id": "prov_123",
        "name": "Dr. Smith",
        "production": 75000,
        "patients": 250
      }
    ]
  }
}
```

### Financial Metrics
```
GET /api/metrics/financial?groupBy=location&period=month
```

Get detailed financial metrics.

**Query Parameters:**
- `groupBy` (string) - location, provider, category
- `period` (string) - day, week, month, quarter, year
- `startDate` (date) - Custom date range start
- `endDate` (date) - Custom date range end

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProduction": 125000,
      "totalCollections": 115000,
      "collectionRate": 0.92
    },
    "breakdown": [
      {
        "locationId": "loc_123",
        "locationName": "Main Office",
        "production": 90000,
        "collections": 85000,
        "adjustments": 3000
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "production": 4500,
        "collections": 4200
      }
    ]
  }
}
```

## Goal Management

### List Goals
```
GET /api/goals?type=production&period=quarter&year=2024
```

Get goals for clinic or providers.

**Query Parameters:**
- `type` (string) - production, collection, newPatients
- `period` (string) - month, quarter, year
- `year` (number) - Goal year
- `providerId` (string) - Filter by provider

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal_123",
      "type": "production",
      "period": "quarter",
      "year": 2024,
      "quarter": 1,
      "target": 75000,
      "actual": 65000,
      "variance": -10000,
      "percentageAchieved": 0.87,
      "providerId": "prov_123",
      "providerName": "Dr. Smith"
    }
  ]
}
```

### Create Goal
```
POST /api/goals
```

Create a new goal.

**Request Body:**
```json
{
  "type": "production",
  "period": "quarter",
  "year": 2024,
  "quarter": 2,
  "target": 80000,
  "providerId": "prov_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "goal_456",
    "type": "production",
    "target": 80000
  }
}
```

### Update Goal
```
PUT /api/goals/{goalId}
```

Update goal target or details.

**Request Body:**
```json
{
  "target": 85000,
  "notes": "Increased based on Q1 performance"
}
```

## Location Management

### List Locations
```
GET /api/locations
```

Get all clinic locations.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "loc_123",
      "name": "Main Office",
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "operatingHours": {
        "monday": { "open": "08:00", "close": "17:00" }
      }
    }
  ]
}
```

### Location Financial Data
```
GET /api/metrics/financial/locations/{locationId}?period=month
```

Get financial data for a specific location.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "location": {
      "id": "loc_123",
      "name": "Main Office"
    },
    "period": "2024-01",
    "metrics": {
      "production": 45000,
      "collections": 42000,
      "newPatients": 15,
      "procedures": 280
    }
  }
}
```

## Clinic Management

### Switch Clinic
```
POST /api/clinics/switch
```

Switch active clinic (for multi-clinic users).

**Request Body:**
```json
{
  "clinicId": "clinic_456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clinicId": "clinic_456",
    "clinicName": "Westside Dental"
  }
}
```

### Get Clinic Statistics
```
GET /api/clinics/{clinicId}/statistics
```

Get clinic-wide statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "providers": {
      "total": 8,
      "active": 7
    },
    "locations": {
      "total": 3,
      "active": 3
    },
    "patients": {
      "total": 2500,
      "active": 1800
    },
    "performance": {
      "ytdProduction": 950000,
      "ytdCollections": 875000,
      "avgMonthlyProduction": 95000
    }
  }
}
```

## Data Synchronization

### Google Sheets Sync
```
POST /api/hygiene-production/sync
```

Trigger manual sync with Google Sheets.

**Request Body:**
```json
{
  "spreadsheetId": "1abc...xyz",
  "sheetName": "Hygiene Production",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

**Response (202):**
```json
{
  "success": true,
  "data": {
    "syncId": "sync_123",
    "status": "processing",
    "message": "Sync initiated, check status endpoint"
  }
}
```

### Check Sync Status
```
GET /api/sync/{syncId}/status
```

Check status of data sync operation.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "syncId": "sync_123",
    "status": "completed",
    "recordsProcessed": 150,
    "recordsCreated": 145,
    "recordsUpdated": 5,
    "errors": [],
    "completedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Export Operations

### Export to CSV
```
POST /api/export/csv
```

Export data to CSV format.

**Request Body:**
```json
{
  "type": "providers",
  "filters": {
    "isActive": true,
    "locationId": "loc_123"
  },
  "columns": ["name", "email", "specialty", "productionYTD"]
}
```

**Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="providers-export-2024-01-15.csv"

Name,Email,Specialty,Production YTD
Dr. Smith,dr.smith@example.com,General Dentistry,250000
Dr. Jones,dr.jones@example.com,Orthodontics,180000
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "Additional error context"
  }
}
```

### Common Error Codes
- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource doesn't exist
- `409` - Conflict: Duplicate resource
- `422` - Unprocessable Entity: Validation errors
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server-side error

### Validation Error Example
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "phoneNumber",
        "message": "Phone number is required"
      }
    ]
  }
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Anonymous**: 10 requests per minute
- **Authenticated**: 100 requests per minute
- **Premium**: 1000 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642435200
```

## Webhook Events

### Available Events
- `provider.created`
- `provider.updated`
- `goal.achieved`
- `sync.completed`
- `metric.threshold_exceeded`

### Webhook Payload
```json
{
  "event": "provider.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "providerId": "prov_123",
    "clinicId": "clinic_123"
  }
}
```

## API Versioning

The API uses header-based versioning:
```
API-Version: v1
```

Supported versions:
- `v1` - Current stable version (default)
- `v2` - Beta features (opt-in)

## Related Resources

- [Backend Architecture](./backend-architecture.md) - Service implementation
- [Data Models](./data-models.md) - Entity specifications
- [External APIs](./external-apis.md) - Third-party integrations

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)
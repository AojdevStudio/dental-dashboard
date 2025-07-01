# External APIs

## Overview

This document details all third-party API integrations used in the Dental Dashboard, including authentication methods, endpoints, rate limits, and integration patterns. The primary external integration is with Google Workspace APIs for spreadsheet data synchronization.

## Quick Reference

| Service | Purpose | Authentication | Rate Limits |
|---------|---------|----------------|-------------|
| Google Sheets API | Data import/sync | OAuth 2.0 | 100 requests/100 seconds |
| Google Drive API | File discovery | OAuth 2.0 | 1000 requests/100 seconds |
| Supabase Auth | User authentication | API Key | No hard limit |
| Supabase Storage | File uploads | API Key | 100MB/file |

## Google Workspace APIs

### Google Sheets API

Primary integration for importing dental practice data from spreadsheets.

#### Authentication

```typescript
// OAuth 2.0 Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes required
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Token storage per clinic
interface GoogleCredentials {
  clinicId: string
  accessToken: string
  refreshToken: string
  expiryDate: number
  scope: string
}
```

#### Key Endpoints

**Get Spreadsheet Values**
```typescript
// Read data from a range
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: 'abc123...',
  range: 'Sheet1!A1:Z1000',
  valueRenderOption: 'UNFORMATTED_VALUE',
  dateTimeRenderOption: 'FORMATTED_STRING'
});

// Response structure
{
  range: string,
  majorDimension: 'ROWS' | 'COLUMNS',
  values: any[][]
}
```

**Batch Get Values**
```typescript
// Read multiple ranges at once
const response = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: 'abc123...',
  ranges: [
    'Providers!A:Z',
    'Daily Production!A:Z',
    'Hygiene Stats!A:Z'
  ]
});
```

**Get Spreadsheet Metadata**
```typescript
// Get sheet structure and properties
const response = await sheets.spreadsheets.get({
  spreadsheetId: 'abc123...',
  includeGridData: false
});

// Useful for discovering sheet names and structure
response.data.sheets.forEach(sheet => {
  console.log(sheet.properties.title);
  console.log(sheet.properties.gridProperties);
});
```

#### Rate Limiting

```typescript
// Rate limit handler
class GoogleApiRateLimiter {
  private requestCount = 0;
  private resetTime = Date.now() + 100000; // 100 seconds
  
  async executeWithRateLimit<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    if (this.requestCount >= 100) {
      const waitTime = this.resetTime - Date.now();
      if (waitTime > 0) {
        await this.delay(waitTime);
      }
      this.requestCount = 0;
      this.resetTime = Date.now() + 100000;
    }
    
    this.requestCount++;
    
    try {
      return await operation();
    } catch (error) {
      if (error.code === 429) {
        // Exponential backoff
        await this.delay(Math.pow(2, this.retryCount) * 1000);
        return this.executeWithRateLimit(operation);
      }
      throw error;
    }
  }
}
```

#### Error Handling

```typescript
// Common Google Sheets API errors
enum GoogleSheetsError {
  PERMISSION_DENIED = 403,      // No access to spreadsheet
  NOT_FOUND = 404,              // Spreadsheet or range not found
  RATE_LIMIT_EXCEEDED = 429,    // Too many requests
  INVALID_RANGE = 400,          // Malformed range specification
  UNAUTHENTICATED = 401         // Invalid or expired token
}

// Error handler
function handleGoogleSheetsError(error: any): never {
  switch (error.code) {
    case 403:
      throw new Error('No permission to access spreadsheet. Please reconnect your Google account.');
    case 404:
      throw new Error('Spreadsheet not found. It may have been deleted or moved.');
    case 429:
      throw new Error('Rate limit exceeded. Please try again later.');
    case 401:
      throw new Error('Google authentication expired. Please reconnect.');
    default:
      throw new Error(`Google Sheets error: ${error.message}`);
  }
}
```

### Google Drive API

Used for discovering and listing available spreadsheets.

#### Key Endpoints

**List Files**
```typescript
// Find spreadsheets in user's drive
const response = await drive.files.list({
  q: "mimeType='application/vnd.google-apps.spreadsheet'",
  fields: 'files(id, name, modifiedTime, createdTime)',
  orderBy: 'modifiedTime desc',
  pageSize: 100
});

// Response
{
  files: [
    {
      id: 'spreadsheet_id',
      name: 'Dental Production Tracker 2024',
      modifiedTime: '2024-01-15T10:30:00Z',
      createdTime: '2024-01-01T08:00:00Z'
    }
  ]
}
```

**Get File Metadata**
```typescript
// Get detailed file information
const response = await drive.files.get({
  fileId: 'spreadsheet_id',
  fields: 'id, name, mimeType, permissions, owners'
});
```

### Data Transformation Pipeline

#### Column Mapping System

```typescript
// Predefined column mappings for common spreadsheet formats
interface ColumnMapping {
  sourceColumn: string      // Spreadsheet column name
  targetField: string       // Database field name
  dataType: DataType       // Expected data type
  transform?: (value: any) => any  // Optional transformation
  required: boolean
  defaultValue?: any
}

// Example mapping for provider data
const PROVIDER_MAPPING: ColumnMapping[] = [
  {
    sourceColumn: 'Provider Name',
    targetField: 'display_name',
    dataType: 'string',
    required: true
  },
  {
    sourceColumn: 'Email',
    targetField: 'email',
    dataType: 'email',
    transform: (value) => value?.toLowerCase().trim(),
    required: true
  },
  {
    sourceColumn: 'License #',
    targetField: 'license_number',
    dataType: 'string',
    transform: (value) => value?.toUpperCase().replace(/\s/g, ''),
    required: true
  },
  {
    sourceColumn: 'YTD Production',
    targetField: 'production_ytd',
    dataType: 'currency',
    transform: (value) => Math.round(parseFloat(value) * 100), // Convert to cents
    required: false,
    defaultValue: 0
  }
];
```

#### Data Validation

```typescript
// Validate imported data
class SpreadsheetDataValidator {
  static validateRow(
    row: any[],
    headers: string[],
    mapping: ColumnMapping[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const data: Record<string, any> = {};
    
    for (const map of mapping) {
      const columnIndex = headers.indexOf(map.sourceColumn);
      
      if (columnIndex === -1) {
        if (map.required) {
          errors.push({
            field: map.targetField,
            message: `Required column "${map.sourceColumn}" not found`
          });
        }
        continue;
      }
      
      const rawValue = row[columnIndex];
      
      // Validate data type
      if (!this.validateDataType(rawValue, map.dataType)) {
        errors.push({
          field: map.targetField,
          message: `Invalid ${map.dataType} value: ${rawValue}`
        });
        continue;
      }
      
      // Apply transformation
      try {
        const value = map.transform ? map.transform(rawValue) : rawValue;
        data[map.targetField] = value ?? map.defaultValue;
      } catch (error) {
        errors.push({
          field: map.targetField,
          message: `Transformation failed: ${error.message}`
        });
      }
    }
    
    return { data, errors, warnings, isValid: errors.length === 0 };
  }
  
  static validateDataType(value: any, type: DataType): boolean {
    if (value === null || value === undefined || value === '') {
      return true; // Empty values handled by required flag
    }
    
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'currency':
        return !isNaN(parseFloat(value.toString().replace(/[$,]/g, '')));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'date':
        return !isNaN(Date.parse(value));
      case 'boolean':
        return ['true', 'false', '1', '0', 'yes', 'no'].includes(
          value.toString().toLowerCase()
        );
      default:
        return true;
    }
  }
}
```

### Sync Patterns

#### Manual Sync

```typescript
// User-triggered sync from dashboard
async function manualSync(clinicId: string, spreadsheetId: string) {
  try {
    // 1. Validate credentials
    const credentials = await getClinicGoogleCredentials(clinicId);
    if (!credentials) {
      throw new Error('Google account not connected');
    }
    
    // 2. Create sync record
    const sync = await createSyncRecord({
      clinicId,
      spreadsheetId,
      status: 'processing'
    });
    
    // 3. Queue background job
    await queueSyncJob({
      syncId: sync.id,
      clinicId,
      spreadsheetId,
      credentials
    });
    
    return { syncId: sync.id, status: 'processing' };
  } catch (error) {
    logger.error('Manual sync failed:', error);
    throw error;
  }
}
```

#### Scheduled Sync

```typescript
// Automated daily sync via Supabase cron
const DAILY_SYNC_SCHEDULE = '0 2 * * *'; // 2 AM daily

// Cron job implementation
async function scheduledSync() {
  // Get all clinics with auto-sync enabled
  const clinics = await getClinicWithAutoSync();
  
  for (const clinic of clinics) {
    try {
      await manualSync(clinic.id, clinic.primarySpreadsheetId);
    } catch (error) {
      await notifyClinicOfSyncFailure(clinic, error);
    }
  }
}
```

#### Incremental Sync

```typescript
// Sync only changed data since last sync
async function incrementalSync(
  clinicId: string,
  spreadsheetId: string,
  lastSyncTime: Date
) {
  // Get sheet metadata to check last modified
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  });
  
  // Check each sheet's revision
  for (const sheet of metadata.data.sheets) {
    const sheetModifiedTime = new Date(sheet.properties.modifiedTime);
    
    if (sheetModifiedTime > lastSyncTime) {
      await syncSheet(spreadsheetId, sheet.properties.title);
    }
  }
}
```

## Supabase Services

### Supabase Auth

Built-in authentication service used for user management.

#### Configuration

```typescript
// Client initialization
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### Key Methods

**Sign Up**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      full_name: 'John Doe',
      clinic_id: 'clinic_123'
    }
  }
})
```

**Sign In**
```typescript
// Email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

**Session Management**
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
})
```

### Supabase Storage

Used for storing profile images and documents.

#### File Upload

```typescript
// Upload provider photo
async function uploadProviderPhoto(
  providerId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${providerId}.${fileExt}`
  const filePath = `provider-photos/${fileName}`
  
  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}
```

#### Storage Policies

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
```

## Webhook Integrations

### Incoming Webhooks

For receiving notifications from external services.

```typescript
// Webhook endpoint
export async function POST(request: Request) {
  // Verify webhook signature
  const signature = request.headers.get('x-webhook-signature')
  if (!verifyWebhookSignature(signature, await request.text())) {
    return new Response('Invalid signature', { status: 401 })
  }
  
  const payload = await request.json()
  
  switch (payload.event) {
    case 'spreadsheet.updated':
      await handleSpreadsheetUpdate(payload)
      break
    case 'payment.completed':
      await handlePaymentCompleted(payload)
      break
    default:
      logger.warn('Unknown webhook event:', payload.event)
  }
  
  return new Response('OK', { status: 200 })
}
```

### Outgoing Webhooks

For notifying external services of events.

```typescript
// Webhook notification service
class WebhookService {
  static async notify(
    url: string,
    event: string,
    data: any
  ): Promise<void> {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    }
    
    const signature = this.generateSignature(payload)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`)
    }
  }
  
  private static generateSignature(payload: any): string {
    const secret = process.env.WEBHOOK_SECRET!
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
  }
}
```

## API Integration Best Practices

### Authentication Storage

```typescript
// Secure storage of API credentials
interface ApiCredentials {
  service: string
  clinicId: string
  credentials: {
    accessToken?: string
    refreshToken?: string
    apiKey?: string
    expiresAt?: Date
  }
  metadata: Record<string, any>
}

// Encrypted storage in database
async function storeApiCredentials(creds: ApiCredentials) {
  const encrypted = await encryptCredentials(creds.credentials)
  
  await prisma.apiCredentials.upsert({
    where: {
      clinicId_service: {
        clinicId: creds.clinicId,
        service: creds.service
      }
    },
    update: {
      credentials: encrypted,
      metadata: creds.metadata,
      updatedAt: new Date()
    },
    create: {
      clinicId: creds.clinicId,
      service: creds.service,
      credentials: encrypted,
      metadata: creds.metadata
    }
  })
}
```

### Retry Logic

```typescript
// Exponential backoff retry
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }
      
      // Calculate delay with jitter
      const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}
```

### Circuit Breaker

```typescript
// Prevent cascading failures
class CircuitBreaker {
  private failures = 0
  private lastFailureTime?: Date
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime!.getTime() > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess() {
    this.failures = 0
    this.state = 'closed'
  }
  
  private onFailure() {
    this.failures++
    this.lastFailureTime = new Date()
    
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }
}
```

## Monitoring and Logging

### API Call Logging

```typescript
// Log all external API calls
interface ApiCallLog {
  service: string
  endpoint: string
  method: string
  requestBody?: any
  responseStatus: number
  responseBody?: any
  duration: number
  error?: string
  clinicId: string
  userId: string
  timestamp: Date
}

async function logApiCall(log: ApiCallLog) {
  // Store in database for analysis
  await prisma.apiCallLog.create({ data: log })
  
  // Alert on errors
  if (log.responseStatus >= 500) {
    await alertOpsTeam(`API error: ${log.service} - ${log.error}`)
  }
}
```

### Performance Monitoring

```typescript
// Track API performance
class ApiPerformanceMonitor {
  static async track<T>(
    service: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - start
      
      // Record metrics
      await this.recordMetric({
        service,
        operation,
        duration,
        success: true
      })
      
      // Alert on slow requests
      if (duration > 5000) {
        logger.warn(`Slow API call: ${service}.${operation} took ${duration}ms`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      await this.recordMetric({
        service,
        operation,
        duration,
        success: false,
        error: error.message
      })
      
      throw error
    }
  }
}
```

## Security Considerations

### API Key Management

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Use separate keys for development/staging/production

### OAuth Token Security

- Store tokens encrypted in database
- Implement token refresh before expiry
- Revoke tokens on user logout
- Use PKCE for OAuth flows

### Rate Limit Management

- Implement client-side rate limiting
- Use queuing for batch operations
- Monitor rate limit headers
- Implement backoff strategies

## Related Resources

- [Backend Architecture](./backend-architecture.md) - Integration patterns
- [Security Considerations](./security-considerations.md) - Security best practices
- [Google Services Setup Guide](../guides/google-services-setup.md) - OAuth configuration

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)
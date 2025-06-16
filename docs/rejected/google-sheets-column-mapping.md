# Google Sheets Column Mapping Documentation

## Overview

The Google Sheets Column Mapping system allows dental practices to map columns from their existing Google Sheets to standardized dental metrics in the dashboard. This enables automatic data synchronization and real-time analytics without requiring users to restructure their existing spreadsheets.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Column Mapping Flow                       │
├─────────────────────────────────────────────────────────────┤
│ 1. User selects spreadsheet and sheet                      │
│ 2. System fetches headers and sample data                  │
│ 3. Auto-detection maps common column names                 │
│ 4. User reviews and adjusts mappings                       │
│ 5. System saves mappings and creates metric definitions    │
│ 6. Data source is configured for synchronization           │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── lib/metrics/
│   └── definitions.ts                    # Standard metric definitions
├── components/google-sheets/
│   └── column-mapping-wizard.tsx         # Main mapping interface
├── app/(dashboard)/integrations/google-sheets/
│   ├── mapping/page.tsx                  # Mapping configuration page
│   └── page.tsx                          # Integration overview page
└── app/api/google-sheets/mapping/
    └── route.ts                          # API endpoints for mapping operations
```

## Standard Metric Definitions

Located in: `src/lib/metrics/definitions.ts`

### Metric Categories

1. **Financial Metrics**
   - `daily_production`: Total production amount for the day
   - `daily_collection`: Total collections received for the day
   - `collection_rate`: Percentage of production collected (composite)
   - `insurance_ar`: Insurance accounts receivable balance
   - `patient_ar`: Patient accounts receivable balance

2. **Patient Metrics**
   - `new_patients`: Number of new patients
   - `total_patients_seen`: Total number of patients seen
   - `active_patients`: Number of active patients in practice
   - `patient_retention_rate`: Percentage of patients retained (composite)

3. **Appointment Metrics**
   - `scheduled_appointments`: Number of appointments scheduled
   - `completed_appointments`: Number of appointments completed
   - `cancelled_appointments`: Number of appointments cancelled
   - `no_show_appointments`: Number of no-show appointments
   - `appointment_completion_rate`: Percentage of scheduled appointments completed (composite)

4. **Provider Metrics**
   - `provider_production`: Production amount by provider
   - `provider_hours`: Hours worked by provider
   - `production_per_hour`: Average production per hour (composite)

5. **Treatment Metrics**
   - `hygiene_production`: Production from hygiene services
   - `restorative_production`: Production from restorative procedures
   - `treatment_acceptance_rate`: Percentage of treatment plans accepted (composite)

### Metric Structure

```typescript
interface MetricDefinition {
  name: string;                    // Unique identifier
  description: string;             // Human-readable description
  dataType: 'currency' | 'percentage' | 'integer' | 'decimal' | 'date';
  category: 'financial' | 'patient' | 'appointment' | 'provider' | 'treatment';
  isComposite: boolean;           // Whether calculated from other metrics
  calculationFormula?: string;    // Formula for composite metrics
  unit?: string;                  // Unit of measurement (USD, hours, etc.)
}
```

### Auto-Detection Mappings

The system includes intelligent column name detection using common variations:

```typescript
const COLUMN_NAME_MAPPINGS: Record<string, string[]> = {
  daily_production: [
    'production', 'daily production', 'total production', 'prod',
    'production amount', 'daily prod', 'production total'
  ],
  new_patients: [
    'new patients', 'new pts', 'new patient', 'np', 'new pt count',
    'new patient count', 'new patients seen'
  ],
  // ... more mappings
};
```

## Column Mapping Wizard Component

Located in: `src/components/google-sheets/column-mapping-wizard.tsx`

### Features

1. **Auto-Detection Display**
   - Shows auto-mapped columns with sparkle badge
   - Highlights confidence level of mappings
   - Allows manual override of auto-detected mappings

2. **Interactive Mapping Table**
   - Source column names with sample data preview
   - Dropdown selection for target metrics (grouped by category)
   - Visual arrow indicators showing mapping direction
   - Data type badges for selected metrics

3. **Progress Tracking**
   - Real-time count of mapped vs unmapped columns
   - Summary of auto-detected mappings
   - Validation before submission

4. **Preview Functionality**
   - Shows final mapping configuration
   - Displays metric categories and data types
   - Confirms mapping accuracy before saving

### Usage

```tsx
<ColumnMappingWizard
  spreadsheetId="1ABC..."
  sheetName="Daily Metrics"
  columns={["Date", "Production", "New Patients", "Collections"]}
  sampleData={[["2024-01-01", "5000", "3", "4500"]]}
  onComplete={(mappings) => handleSaveMapping(mappings)}
  onCancel={() => router.back()}
/>
```

### Output Format

```typescript
interface ColumnMapping {
  sourceColumn: string;           // Original column name from spreadsheet
  targetMetric: string;          // Mapped metric name
  transformationRule?: string;   // Optional data transformation rule
}
```

## API Endpoints

Located in: `src/app/api/google-sheets/mapping/route.ts`

### POST /api/google-sheets/mapping

Supports both bulk mapping operations and individual mapping creation.

#### Bulk Mapping (from wizard)

**Request:**
```json
{
  "spreadsheetId": "1ABC...",
  "sheetName": "Daily Metrics",
  "mappings": [
    {
      "sourceColumn": "Production",
      "targetMetric": "daily_production",
      "transformationRule": null
    },
    {
      "sourceColumn": "New Pts",
      "targetMetric": "new_patients",
      "transformationRule": null
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "dataSourceId": "ds_123...",
  "mappingCount": 2,
  "createdMetrics": 0
}
```

#### Individual Mapping

**Request:**
```json
{
  "dataSourceId": "ds_123...",
  "metricDefinitionId": "md_456...",
  "columnName": "Production",
  "transformationRule": null
}
```

### GET /api/google-sheets/mapping

Retrieves existing column mappings for a data source.

**Query Parameters:**
- `dataSourceId`: UUID of the data source

**Response:**
```json
{
  "mappings": [
    {
      "id": "cm_789...",
      "columnName": "Production",
      "metricDefinition": {
        "name": "daily_production",
        "description": "Total production amount for the day",
        "dataType": "currency",
        "category": "financial"
      },
      "transformationRule": null
    }
  ]
}
```

## Database Schema

### Tables Involved

1. **DataSource** (`data_sources`)
   ```sql
   - id: String (primary key)
   - name: String
   - spreadsheetId: String
   - sheetName: String
   - clinicId: String (foreign key to clinics)
   - connectionStatus: String
   - syncFrequency: String
   - accessToken: String (encrypted)
   - refreshToken: String (encrypted)
   ```

2. **MetricDefinition** (`metric_definitions`)
   ```sql
   - id: String (primary key)
   - clinicId: String (foreign key to clinics)
   - name: String
   - description: String
   - dataType: String
   - category: String
   - isComposite: Boolean
   - calculationFormula: String (nullable)
   - unit: String (nullable)
   - isActive: Boolean
   ```

3. **ColumnMapping** (`column_mappings`)
   ```sql
   - id: String (primary key)
   - dataSourceId: String (foreign key to data_sources)
   - metricDefinitionId: String (foreign key to metric_definitions)
   - columnName: String
   - transformationRule: String (nullable)
   - isActive: Boolean
   ```

### Relationships

```
Clinic (1) ──→ (∞) DataSource
Clinic (1) ──→ (∞) MetricDefinition
DataSource (1) ──→ (∞) ColumnMapping
MetricDefinition (1) ──→ (∞) ColumnMapping
```

## User Flow

### 1. Access Mapping Page

Navigate to `/integrations/google-sheets/mapping?spreadsheetId=ABC&sheetName=Sheet1`

### 2. Data Fetching

System automatically:
- Fetches spreadsheet metadata via Google Sheets API
- Retrieves first 10 rows for sample data preview
- Extracts column headers from first row

### 3. Auto-Detection

System analyzes column headers and:
- Matches against common naming patterns
- Suggests metric mappings
- Highlights auto-detected columns with visual indicators

### 4. Manual Review

User can:
- Review auto-detected mappings
- Manually map unmapped columns
- Override auto-detected mappings
- Skip columns that don't need mapping

### 5. Preview and Save

User can:
- Preview final mapping configuration
- See metric categories and data types
- Save mappings to database

### 6. Confirmation

System provides:
- Success notification
- Next steps (dashboard view, data sync testing)
- Clear path forward

## Error Handling

### Client-Side Errors

1. **Missing Parameters**
   - Redirects to integration overview page
   - Shows error message with guidance

2. **API Failures**
   - Displays user-friendly error messages
   - Provides retry options
   - Maintains form state

3. **Validation Errors**
   - Real-time validation feedback
   - Prevents submission with invalid data
   - Clear error descriptions

### Server-Side Errors

1. **Authentication Errors**
   - Returns 401 for unauthenticated requests
   - Returns 403 for insufficient permissions

2. **Data Validation**
   - Validates request schema using Zod
   - Returns 400 with detailed error information

3. **Database Errors**
   - Uses transactions for data consistency
   - Proper error logging
   - Graceful failure handling

## Security Considerations

### Authentication & Authorization

- All endpoints require valid Supabase authentication
- Clinic admin role required for mapping operations
- Row-level security ensures data isolation

### Data Protection

- Google OAuth tokens stored encrypted
- Sensitive data excluded from API responses
- Audit trail for mapping changes

### Input Validation

- Strict schema validation using Zod
- Sanitization of user inputs
- Prevention of SQL injection

## Performance Considerations

### Database Optimizations

- Indexes on foreign key relationships
- Efficient query patterns
- Batched operations for bulk mappings

### Caching Strategy

- Client-side caching of metric definitions
- Optimistic updates for better UX
- Efficient re-fetching patterns

### API Rate Limits

- Respects Google Sheets API quotas
- Implements retry logic with exponential backoff
- Batches requests where possible

## Testing

### Unit Tests

```bash
# Test metric definitions
pnpm test src/lib/metrics/definitions.test.ts

# Test column mapping wizard
pnpm test src/components/google-sheets/column-mapping-wizard.test.tsx

# Test API endpoints
pnpm test src/app/api/google-sheets/mapping/route.test.ts
```

### Integration Tests

```bash
# Test full mapping flow
pnpm test:integration google-sheets-mapping

# Test database operations
pnpm test:integration mapping-database
```

### Manual Testing

1. **Happy Path**
   - Navigate to mapping page with valid spreadsheet
   - Verify auto-detection works
   - Save mappings successfully
   - Confirm success message and next steps

2. **Error Cases**
   - Invalid spreadsheet ID
   - Network failures
   - Permission errors
   - Validation failures

## Future Enhancements

### Planned Features

1. **Advanced Transformations**
   - Custom transformation rules
   - Data type conversions
   - Formula-based mappings

2. **Bulk Operations**
   - Import/export mapping templates
   - Copy mappings between spreadsheets
   - Batch mapping updates

3. **Validation Rules**
   - Data quality checks
   - Range validations
   - Custom business rules

4. **Analytics**
   - Mapping success rates
   - Most common column patterns
   - Auto-detection accuracy metrics

### Technical Debt

1. **Multi-Clinic Support**
   - Currently uses first clinic only
   - Need proper clinic selection UI
   - Handle multi-clinic permissions

2. **Config Field Migration**
   - Legacy config field usage
   - Migration to dedicated mapping tables
   - Backward compatibility maintenance

## Troubleshooting

### Common Issues

1. **Auto-Detection Not Working**
   - Check column naming patterns in `COLUMN_NAME_MAPPINGS`
   - Verify case-insensitive matching
   - Add new patterns as needed

2. **Mapping Save Failures**
   - Check user permissions (clinic admin required)
   - Verify metric definitions exist
   - Check database constraints

3. **Missing Sample Data**
   - Ensure spreadsheet has data in first 10 rows
   - Check Google Sheets API permissions
   - Verify sheet name accuracy

### Debug Steps

1. **Check Browser Console**
   - Look for JavaScript errors
   - Verify API request/response format
   - Check network connectivity

2. **Review Server Logs**
   - Check authentication status
   - Verify database operations
   - Look for validation errors

3. **Database Verification**
   - Confirm clinic association
   - Check metric definition creation
   - Verify column mapping records

## Support

For technical issues or questions:

1. Check this documentation first
2. Review error messages and logs
3. Test with minimal data set
4. Contact development team with:
   - Spreadsheet ID (if safe to share)
   - Error messages
   - Steps to reproduce
   - Browser and environment details
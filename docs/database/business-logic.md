# Business Logic Documentation

This document outlines the business logic validation rules implemented in the dental practice management system, particularly focusing on financial data processing, validation, and multi-clinic architecture.

## Multi-Clinic Architecture

### Clinic Entity Separation

The system implements a **multi-clinic architecture** where each physical location operates as a separate clinic entity:

- **KamDental Baytown**: Clinic ID `cmbk373hc0000i2uk8pel5elu`
- **KamDental Humble**: Clinic ID `cmbk373qi0001i2ukewr01bvz`

### Data Isolation Rules

1. **Location-Based Clinic Assignment**
   - Baytown location data → Baytown clinic entity
   - Humble location data → Humble clinic entity
   - Automatic detection via Google Apps Script based on sheet names

2. **Database Segregation**
   - Each clinic maintains separate financial records
   - Row Level Security (RLS) policies enforce clinic-based access
   - Cross-clinic data access prevented at database level

3. **Sync Architecture**
   - Google Apps Script detects location from sheet names
   - Appropriate clinic ID selected automatically
   - Independent API calls for each location
   - Separate error handling and logging per clinic

## Location Financial Data Validation

### Data Processing Rules

The location financial import system (`/upload/supabase/functions/location-financial-import/index.ts`) implements comprehensive business logic validation for financial data integrity.

#### Core Financial Calculations

1. **Net Production Calculation**
   ```typescript
   netProduction = production - adjustments - writeOffs
   ```

2. **Total Collections Calculation**
   ```typescript
   totalCollections = patientIncome + insuranceIncome
   ```

#### Business Validation Rules

##### 1. Production Value Validation
- **Rule**: Production values can be negative if adjustments and write-offs exceed the day's gross production
- **Threshold Warning**: Daily production > $100,000 triggers unusual value warning
- **Implementation**: Basic range checking to catch unusually high daily production values
- **Rationale**: While negative production is possible, daily production exceeding $100,000 is extremely unusual for most dental practices and may indicate:
  - Data entry errors (extra zeros, wrong decimal placement)
  - Accidentally importing weekly/monthly totals as daily values
  - Multiple days of data combined into a single record
  - Large insurance batch payments incorrectly recorded as production
  - Importing procedure codes as dollar amounts

##### 2. Financial Value Flexibility
- **Rule**: All financial values (production, adjustments, writeOffs, patientIncome, insuranceIncome) can be positive or negative depending on business scenarios
- **Implementation**: No hard constraints on positive/negative values
- **Rationale**: 
  - Production can be negative when adjustments/write-offs exceed gross production
  - Income can be negative due to refunds, chargebacks, or payment reversals
  - Adjustments and write-offs vary based on accounting practices
  - Business scenarios are too diverse for rigid positive/negative rules

##### 3. Collections vs Production Relationship
- **Rule**: Collections can legitimately exceed production up to 2x the production amount
- **Warning Threshold**: Collections > 2x production triggers verification warning (not error)
- **Implementation**: 
  ```typescript
  if (totalCollections > production * 2 && production > 0) {
    warnings.push(`Record ${recordIndex}: collections ($${totalCollections}) are more than 2x production ($${production}) - please verify data entry`);
  }
  ```

#### Why Collections Can Exceed Production

This is a **critical business understanding** for dental practice financials:

1. **Timing Differences**: Procedures performed in one period may be collected in another
2. **Payment Plans**: Patients may pay for previous treatments
3. **Insurance Delays**: Insurance payments often arrive weeks/months after treatment
4. **Multiple Treatment Collections**: Collecting for multiple procedures from different dates
5. **Adjustments and Corrections**: Previous period adjustments affecting current collections

**Reference**: [Dental Billing Collection Percentage Variables](https://dentalbilling.com/what-variables-affect-office-collections-percentage/)

##### 4. Calculation Integrity Validation
- **Net Production Verification**: Ensures calculated net production matches expected formula
- **Total Collections Verification**: Ensures calculated total matches sum of income sources
- **Tolerance**: 0.01 cent precision for floating-point calculations

#### Performance and Security Rules

##### 1. Request Size Limits
- **Maximum Records**: 5,000 records per batch
- **Rationale**: Prevents system abuse and ensures reasonable processing times

##### 2. Timeout Protection
- **Processing Timeout**: 2 minutes (120,000ms)
- **Check Frequency**: Every 10 records during validation
- **Implementation**: Proactive timeout detection prevents function timeouts

##### 3. Batch Processing Optimization
- **Existing Record Checks**: Batch lookup instead of individual queries
- **Performance**: Reduces N+1 query problems (713 records: 1,426 queries → 3 queries)

#### Location Validation Rules

##### 1. Location Existence
- **Rule**: All referenced locations must exist in the clinic's location registry
- **Case Sensitivity**: Location matching is case-insensitive with trimmed whitespace
- **Error Handling**: Missing locations generate validation errors

##### 2. Location Status
- **Rule**: Inactive locations trigger warnings but don't prevent processing
- **Rationale**: Historical data may reference currently inactive locations

#### Data Quality Assurance

##### 1. Date Validation
- **Rule**: All dates must be valid JavaScript Date objects
- **Format**: ISO date strings are preferred
- **Range**: No specific date range restrictions (allows historical data)

##### 2. Duplicate Detection
- **Upsert Mode**: Default behavior allows updating existing records
- **Non-Upsert Mode**: Checks for existing records and warns about duplicates
- **Key**: Combination of clinic_id, location_id, and date

#### Error Classification

##### Validation Errors (Processing Stops)
- Invalid or missing required fields (date, locationName)
- Negative financial values
- Invalid date formats
- Missing location references
- Calculation mismatches

##### Warnings (Processing Continues)
- Unusually high production values
- Collections > 2x production
- Inactive location references
- Duplicate records in non-upsert mode

## Data Source and Syncing

### Sync Architecture

The system does not use a direct, real-time integration with Google Sheets. Instead, it relies on a one-way data push mechanism initiated by a Google Apps Script.

- **Data Source**: The single source of truth for raw financial data is Google Sheets.
- **Trigger**: A Google Apps Script is manually or automatically run from within the Google Sheet environment.
- **Process**:
    1. The script reads the financial data from the sheet.
    2. It detects the appropriate clinic (Baytown or Humble) based on the sheet's name.
    3. It formats the data into a JSON payload.
    4. It sends this payload via a `POST` request to a Supabase Edge Function (e.g., `/location-financial-import`) or directly to the Supabase REST API.
- **Data Flow**: This is a one-way push: `Google Sheets -> Google Apps Script -> Supabase API`. There is no process for syncing data back from Supabase to Google Sheets.

### Data Processing Rules

The Supabase Edge Function (`/upload/supabase/functions/location-financial-import/index.ts`) is responsible for receiving the data from the Google Apps Script and implements comprehensive business logic validation for financial data integrity.

#### Core Financial Calculations

1. **Net Production Calculation**
   ```typescript
   netProduction = production - adjustments - writeOffs
   ```

2. **Total Collections Calculation**
   ```typescript
   totalCollections = patientIncome + insuranceIncome
   ```

#### Business Validation Rules

##### 1. Production Value Validation
- **Rule**: Production values can be negative if adjustments and write-offs exceed the day's gross production
- **Threshold Warning**: Daily production > $100,000 triggers unusual value warning
- **Implementation**: Basic range checking to catch unusually high daily production values
- **Rationale**: While negative production is possible, daily production exceeding $100,000 is extremely unusual for most dental practices and may indicate:
  - Data entry errors (extra zeros, wrong decimal placement)
  - Accidentally importing weekly/monthly totals as daily values
  - Multiple days of data combined into a single record
  - Large insurance batch payments incorrectly recorded as production
  - Importing procedure codes as dollar amounts

##### 2. Financial Value Flexibility
- **Rule**: All financial values (production, adjustments, writeOffs, patientIncome, insuranceIncome) can be positive or negative depending on business scenarios
- **Implementation**: No hard constraints on positive/negative values
- **Rationale**: 
  - Production can be negative when adjustments/write-offs exceed gross production
  - Income can be negative due to refunds, chargebacks, or payment reversals
  - Adjustments and write-offs vary based on accounting practices
  - Business scenarios are too diverse for rigid positive/negative rules

##### 3. Collections vs Production Relationship
- **Rule**: Collections can legitimately exceed production up to 2x the production amount
- **Warning Threshold**: Collections > 2x production triggers verification warning (not error)
- **Implementation**: 
  ```typescript
  if (totalCollections > production * 2 && production > 0) {
    warnings.push(`Record ${recordIndex}: collections ($${totalCollections}) are more than 2x production ($${production}) - please verify data entry`);
  }
  ```

#### Why Collections Can Exceed Production

This is a **critical business understanding** for dental practice financials:

1. **Timing Differences**: Procedures performed in one period may be collected in another
2. **Payment Plans**: Patients may pay for previous treatments
3. **Insurance Delays**: Insurance payments often arrive weeks/months after treatment
4. **Multiple Treatment Collections**: Collecting for multiple procedures from different dates
5. **Adjustments and Corrections**: Previous period adjustments affecting current collections

**Reference**: [Dental Billing Collection Percentage Variables](https://dentalbilling.com/what-variables-affect-office-collections-percentage/)

##### 4. Calculation Integrity Validation
- **Net Production Verification**: Ensures calculated net production matches expected formula
- **Total Collections Verification**: Ensures calculated total matches sum of income sources
- **Tolerance**: 0.01 cent precision for floating-point calculations

#### Performance and Security Rules

##### 1. Request Size Limits
- **Maximum Records**: 5,000 records per batch
- **Rationale**: Prevents system abuse and ensures reasonable processing times

##### 2. Timeout Protection
- **Processing Timeout**: 2 minutes (120,000ms)
- **Check Frequency**: Every 10 records during validation
- **Implementation**: Proactive timeout detection prevents function timeouts

##### 3. Batch Processing Optimization
- **Existing Record Checks**: Batch lookup instead of individual queries
- **Performance**: Reduces N+1 query problems (713 records: 1,426 queries → 3 queries)

#### Location Validation Rules

##### 1. Location Existence
- **Rule**: All referenced locations must exist in the clinic's location registry
- **Case Sensitivity**: Location matching is case-insensitive with trimmed whitespace
- **Error Handling**: Missing locations generate validation errors

##### 2. Location Status
- **Rule**: Inactive locations trigger warnings but don't prevent processing
- **Rationale**: Historical data may reference currently inactive locations

#### Data Quality Assurance

##### 1. Date Validation
- **Rule**: All dates must be valid JavaScript Date objects
- **Format**: ISO date strings are preferred
- **Range**: No specific date range restrictions (allows historical data)

##### 2. Duplicate Detection
- **Upsert Mode**: Default behavior allows updating existing records
- **Non-Upsert Mode**: Checks for existing records and warns about duplicates
- **Key**: Combination of clinic_id, location_id, and date

#### Error Classification

##### Validation Errors (Processing Stops)
- Invalid or missing required fields (date, locationName)
- Negative financial values
- Invalid date formats
- Missing location references
- Calculation mismatches

##### Warnings (Processing Continues)
- Unusually high production values
- Collections > 2x production
- Inactive location references
- Duplicate records in non-upsert mode

## Data Source Timestamp Management

- **Rule**: A successful data import that creates or updates records will update the `data_source.last_synced_at` timestamp in Supabase.
- **Condition**: This update only occurs if the script successfully processes records.
- **Error Handling**: Failures during the API call or data processing in the Edge Function are logged but do not update the timestamp.

## Security Considerations

### Database Access
- **Service Role**: Uses Supabase service_role for database operations
- **Row Level Security**: Respects clinic-based RLS policies
- **Environment Variables**: Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

### Input Validation
- **JSON Parsing**: Validates request body structure
- **Field Validation**: Type checking for all input fields
- **Sanitization**: Prevents injection attacks through parameterized queries

## Implementation Notes

### Database Schema Alignment
- **Column Naming**: Uses snake_case for database columns (clinic_id, location_id)
- **Type Mapping**: Proper TypeScript to PostgreSQL type conversion
- **Precision**: DECIMAL fields for financial data to avoid floating-point errors

### Monitoring and Logging
- **Execution Timing**: Comprehensive timing logs for performance monitoring
- **Error Context**: Detailed error messages with record-specific context
- **Progress Tracking**: Batch processing progress indicators

## Future Enhancements

Areas for potential business logic expansion:

1. **Seasonal Adjustment Rules**: Account for typical seasonal variations in dental practices
2. **Provider-Specific Validations**: Different validation rules based on provider type
3. **Insurance-Specific Logic**: Validation rules specific to different insurance carriers
4. **Historical Trend Analysis**: Validation against historical patterns for anomaly detection

## References

This business logic implementation is informed by dental industry best practices and will be expanded with additional reference materials as provided.
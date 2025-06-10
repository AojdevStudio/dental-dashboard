# PRD: Google Apps Script for Location-Based Financial Data Sync (AOJ-46)

## Summary

This document outlines the requirements for developing a Google Apps Script to synchronize comprehensive location-based financial data from Google Sheets to the Supabase database via the LocationFinancial API endpoints established in AOJ-44. The script will automate the data pipeline for location-specific financial tracking, supporting multiple locations with robust error handling, data validation, and both manual and automated synchronization capabilities.

## Priority & Timeline Assessment

**Priority:** High (Critical for Data Pipeline)
- **Status:** Overdue (Due Date: June 5th)
- **Blocks:** Automated financial data synchronization, location-based reporting accuracy
- **Enables:** Real-time financial dashboard updates, automated data pipeline, reduced manual data entry
- **Timeline:** 1-2 weeks (Medium complexity with established patterns)
- **Complexity:** Medium (API integration, data validation, error handling, multiple data sources)

**Due Date Recommendation:** Immediate (overdue)
**Labels:** google-apps-script, data-sync, high-priority, overdue

## User Stories

**US1:** As a Data Manager, I want financial data from Google Sheets to automatically sync to the dashboard database, so that location-specific financial reports are always current without manual intervention.

**US2:** As a Clinic Administrator, I want to manually trigger data synchronization when needed, so that I can ensure critical financial updates are reflected immediately in the dashboard.

**US3:** As a System Administrator, I want comprehensive error handling and logging in the sync process, so that data integrity issues can be quickly identified and resolved.

**US4:** As a Financial Analyst, I want the sync process to handle all financial data types (production, collections, adjustments, write-offs, patient income, insurance income), so that comprehensive financial analysis is possible.

**US5:** As a Developer, I want the script to follow established patterns and case-insensitive data handling, so that it integrates seamlessly with existing systems and is maintainable.

## Functional Expectations

### 3.1. Core Synchronization Engine

**LocationFinancialSync.gs - Main Script:**
```javascript
// Configuration
const SUPABASE_URL = 'https://your-project.supabase.co';
 const IMPORT_ENDPOINT = '/api/metrics/financial/locations/import';

// Location mapping (consistent with AOJ-44)
 const LOCATION_MAP = {
  'BT': 'Baytown',
  'HM': 'Humble'
 };

// Financial data column patterns (case-insensitive)
const FINANCIAL_COLUMNS = {
  DATE: ['date', 'transaction date', 'day'],
  PRODUCTION: ['production', 'gross production', 'daily production'],
  ADJUSTMENTS: ['adjustments', 'adjustment', 'adj'],
  WRITE_OFFS: ['write offs', 'writeoffs', 'write-offs', 'insurance writeoffs'],
  PATIENT_INCOME: ['patient income', 'patient collections', 'patient pay'],
  INSURANCE_INCOME: ['insurance income', 'insurance collections', 'insurance pay'],
  UNEARNED: ['unearned', 'unearned income', 'prepaid']
};
```

### 3.2. Enhanced Data Processing

**Comprehensive Financial Data Mapping:**
- Support for all LocationFinancial model fields
- Automatic calculation of netProduction and totalCollections
- Flexible column mapping with case-insensitive matching
- Data validation and type conversion
- Date formatting standardization

**Multi-Location Support:**
- Process multiple sheet tabs (Baytown, Humble)
- Location-specific data validation
- Proper foreign key mapping to Location entities
- Support for future location additions

### 3.3. User Interface & Controls

**Menu System:**
```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Financial Data Sync')
    .addItem('Sync All Locations', 'syncAllLocationFinancialData')
    .addItem('Sync Baytown Only', 'syncBaytownFinancialData')
    .addItem('Sync Humble Only', 'syncHumbleFinancialData')
    .addItem('Validate Data Format', 'validateDataFormat')
    .addItem('Setup Auto-Sync', 'setupDailyTriggers')
    .addToUi();
}
```

**Manual Sync Options:**
- Individual location synchronization
- All locations batch sync
- Data validation and preview
- Error reporting and diagnostics

### 3.4. API Integration

**LocationFinancial Import Endpoint Integration:**
```javascript
function syncToLocationFinancialAPI(locationData) {
   const payload = {
     clinicId: 'clinic-uuid',
    dataSourceId: 'google-sheets-location-financial-sync',
    records: locationData.records.map(record => ({
       date: record.date,
      locationName: locationData.locationName,
       production: record.production,
       adjustments: record.adjustments,
       writeOffs: record.writeOffs,
       patientIncome: record.patientIncome,
       insuranceIncome: record.insuranceIncome,
      unearned: record.unearned
    })),
    upsert: true,
    dryRun: false
   };
   
   // API call with proper authentication and error handling
 }
```

**Enhanced Error Handling:**
- API response validation
- Retry logic for transient failures
- Detailed error logging with context
- User-friendly error notifications
- Rollback capabilities for failed batches

### 3.5. Data Validation & Quality

**Pre-Sync Validation:**
- Required field presence checking
- Data type validation (dates, numbers)
- Range validation for financial amounts
- Duplicate detection within batch
- Format consistency verification

**Case-Insensitive Processing:**
- Header matching with flexible patterns
- Configuration value comparisons
- Sheet name handling
- Data value standardization

## Affected Files

**Google Apps Script Files:**
- `scripts/google-apps-script/location-financials-sync/LocationFinancialSync.gs` - Main synchronization script
- `scripts/google-apps-script/location-financials-sync/Config.gs` - Configuration and column mappings
- `scripts/google-apps-script/location-financials-sync/DataProcessor.gs` - Data validation and transformation
- `scripts/google-apps-script/location-financials-sync/APIClient.gs` - Supabase API integration
- `scripts/google-apps-script/location-financials-sync/ErrorHandler.gs` - Error handling and logging utilities

**Integration Points:**
- `src/app/api/metrics/financial/locations/import/route.ts` - Import API endpoint (from AOJ-44)
- Location entities and relationships (from AOJ-44)
- LocationFinancial data model (from AOJ-44)

**Documentation:**
- `docs/google-apps-script/location-financial-sync-setup.md` - Setup and deployment guide
- `docs/google-apps-script/location-financial-sync-troubleshooting.md` - Error handling and debugging guide

## Implementation Strategy

### Phase 1: Core Script Development (Week 1)
1. **Base Script Structure**
   - Create main LocationFinancialSync.gs with menu system
   - Implement configuration management
   - Set up location mapping and column patterns

2. **Data Processing Engine**
   - Build flexible column mapping with case-insensitive matching
   - Implement data validation and transformation
   - Create date formatting and numeric parsing utilities

3. **API Integration**
   - Integrate with LocationFinancial import endpoint
   - Implement authentication and error handling
   - Add retry logic and response validation

### Phase 2: Enhanced Features (Week 2)
1. **Advanced Data Handling**
   - Implement calculated fields (netProduction, totalCollections)
   - Add support for all financial data types
   - Create data quality validation

2. **Automation & Triggers**
   - Set up daily automated synchronization
   - Implement edit-based triggers for real-time sync
   - Add trigger management utilities

3. **Error Handling & Logging**
   - Comprehensive error logging system
   - User notification system
   - Debugging and diagnostic tools

### Phase 3: Testing & Deployment (Concurrent)
1. **Testing Strategy**
   - Unit testing for data processing functions
   - Integration testing with API endpoints
   - End-to-end testing with sample data

2. **Documentation & Training**
   - Setup and deployment documentation
   - User guide for manual operations
   - Troubleshooting and maintenance guide

## AI Guardrails Implementation Strategy

**File-Level Constraints:**
- Separate concerns into focused script files (sync, config, processing, API, errors)
- Limit each script file to single responsibility
- Isolate API integration from data processing logic

**Change Type Isolation:**
- Configuration changes in dedicated Config.gs file
- Data processing logic in separate DataProcessor.gs
- API integration isolated in APIClient.gs
- Error handling centralized in ErrorHandler.gs

**Incremental Validation Protocol:**
- Test each script component independently
- Validate API integration with dry-run mode
- Verify data transformation accuracy
- Test error handling scenarios

**Safety Prompts for AI Sessions:**
- Always test with sample data before production deployment
- Validate API authentication and permissions
- Verify location mapping accuracy
- Test error handling and recovery mechanisms

## Risk Assessment & Mitigation

**High-Risk Areas:**
1. **Data Integrity**
   - Risk: Incorrect financial data synchronization
   - Mitigation: Comprehensive validation, dry-run testing, rollback capabilities

2. **API Rate Limiting**
   - Risk: Sync failures due to API limits
   - Mitigation: Batch processing, retry logic, rate limiting awareness

3. **Authentication Issues**
   - Risk: API access failures
   - Mitigation: Secure key management, authentication validation, error handling

4. **Data Format Variations**
   - Risk: Sync failures due to sheet format changes
   - Mitigation: Flexible column mapping, case-insensitive processing, validation

**Mitigation Strategies:**
- Comprehensive testing with various data formats
- Robust error handling and user notifications
- Clear documentation and troubleshooting guides
- Regular monitoring and maintenance procedures

## Technical Specifications

### Data Processing Requirements
- **Case-Insensitive Matching**: All string comparisons use toLowerCase()
- **Date Formatting**: Standardized to YYYY-MM-DD format
- **Numeric Validation**: Proper parsing with fallback to 0
- **Required Fields**: Date, location identifier, at least one financial amount
- **Calculated Fields**: Automatic computation of netProduction and totalCollections

### Performance Requirements
- **Batch Size**: Process up to 1000 records per sync operation
- **Response Time**: Complete sync within 30 seconds for typical datasets
- **Error Recovery**: Automatic retry for transient failures (max 3 attempts)
- **Memory Usage**: Efficient processing to avoid script timeout

### Security Requirements
- **API Key Management**: Secure storage using PropertiesService
- **Data Validation**: Input sanitization and type checking
- **Error Logging**: No sensitive data in logs
- **Access Control**: Script permissions limited to necessary scopes

## Success Metrics

### Functional Metrics
- **Sync Accuracy**: 100% data integrity validation
- **Error Rate**: <1% failed sync operations
- **Performance**: <30 seconds for typical sync operations
- **Automation**: Daily sync completion rate >99%

### User Experience Metrics
- **Manual Sync Success**: >95% successful manual operations
- **Error Resolution**: Clear error messages and resolution guidance
- **Setup Time**: <30 minutes for initial deployment
- **Maintenance**: Minimal ongoing maintenance requirements

## Additional Considerations

**Scalability:**
- Support for additional locations without code changes
- Configurable column mappings for sheet variations
- Extensible data validation rules
- Performance optimization for larger datasets

**Maintenance:**
- Clear documentation for troubleshooting
- Modular code structure for easy updates
- Version control and deployment procedures
- Regular testing and validation protocols

**Integration:**
- Seamless integration with AOJ-44 infrastructure
- Compatible with existing Google Sheets workflows
- Support for future API enhancements
- Extensible for additional data types

**Future Enhancements:**
- Real-time sync capabilities
- Advanced data validation rules
- Custom notification systems
- Integration with other data sources 
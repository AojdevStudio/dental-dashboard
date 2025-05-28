# Multi-Tenant Tables Documentation

## Overview
This document describes the new tables added in Phase 1 of the database migration to support multi-tenant functionality, advanced metrics tracking, and Google Sheets integration.

## New Tables Summary

### 1. user_clinic_roles
**Purpose**: Enables users to have different roles across multiple clinics, supporting true multi-tenant access control.

**Key Features**:
- Maps users to clinics with specific roles
- Supports multiple clinic access per user
- Role-based permissions (clinic_admin, provider, staff, viewer)
- Active/inactive status for temporary access control

**Use Cases**:
- Dentists working at multiple clinics
- Administrative staff managing multiple locations
- Consultants with limited-time access

### 2. goal_templates
**Purpose**: Provides reusable goal configurations that can be applied across clinics or customized per clinic.

**Key Features**:
- System-wide templates for common goals
- Clinic-specific custom templates
- Formula-based target calculations
- Links to metric definitions

**Use Cases**:
- "Increase production by 10% month-over-month"
- "Maintain 95% hygiene reactivation rate"
- "Reduce no-shows to under 5%"

### 3. financial_metrics
**Purpose**: Tracks detailed financial data with support for various categorizations and analysis dimensions.

**Key Features**:
- Production, collection, adjustment, and refund tracking
- Provider-level financial attribution
- Insurance carrier analysis
- Payment method tracking
- Procedure code integration

**Use Cases**:
- Daily production reports by provider
- Insurance vs. cash payment analysis
- Collection rate monitoring
- Procedure profitability analysis

### 4. appointment_metrics
**Purpose**: Captures appointment-related analytics for schedule optimization and efficiency tracking.

**Key Features**:
- Appointment type categorization
- Completion, cancellation, and no-show tracking
- Schedule utilization analysis
- Production per appointment tracking

**Use Cases**:
- Provider schedule efficiency reports
- Appointment type distribution analysis
- No-show pattern identification
- Revenue per appointment hour

### 5. call_metrics
**Purpose**: Tracks call center performance and conversion rates for different call types.

**Key Features**:
- Call type classification (recall, follow-up, new patient)
- Conversion rate tracking
- Staff member performance metrics
- Call duration analysis

**Use Cases**:
- Hygiene recall campaign effectiveness
- Treatment plan follow-up success rates
- New patient inquiry conversion
- Staff training needs identification

### 6. patient_metrics
**Purpose**: Monitors patient population health and practice growth indicators.

**Key Features**:
- Active patient count tracking
- New patient acquisition monitoring
- Patient retention analysis
- Treatment acceptance rates
- Recare compliance tracking

**Use Cases**:
- Practice growth monitoring
- Patient retention strategies
- Marketing effectiveness measurement
- Treatment planning success analysis

### 7. metric_aggregations
**Purpose**: Pre-computed aggregations for improved dashboard performance.

**Key Features**:
- Multiple aggregation periods (daily, weekly, monthly, etc.)
- Statistical measures (min, max, avg, std dev)
- Provider-level aggregations
- Metadata storage for complex calculations

**Use Cases**:
- Fast dashboard loading
- Historical trend analysis
- Comparative reporting
- Variance analysis

### 8. google_credentials
**Purpose**: Securely stores Google OAuth credentials for API access.

**Key Features**:
- Encrypted token storage
- Per-clinic and per-user credentials
- Automatic expiration tracking
- Scope management

**Security Notes**:
- Tokens must be encrypted before storage
- Implement automatic refresh before expiration
- Regular credential rotation recommended

### 9. spreadsheet_connections
**Purpose**: Manages connections to Google Sheets data sources.

**Key Features**:
- Multiple sheets per clinic
- Sync status tracking
- Connection health monitoring
- Sheet metadata storage

**Use Cases**:
- Production tracking spreadsheets
- Call log imports
- Financial data synchronization
- Custom metric imports

### 10. column_mappings_v2
**Purpose**: Flexible configuration for mapping spreadsheet columns to system metrics.

**Key Features**:
- JSONB configuration for flexibility
- Version control for mapping changes
- Template support for common patterns
- Active/inactive status

**Configuration Example**:
```json
{
  "mappings": [
    {
      "source_column": "Provider Name",
      "target_field": "provider_id",
      "transform": "lookup",
      "lookup_table": "providers",
      "lookup_field": "name"
    },
    {
      "source_column": "Production Amount",
      "target_field": "amount",
      "transform": "currency",
      "currency_format": "USD"
    }
  ],
  "validation_rules": {
    "required_columns": ["Date", "Provider Name", "Production Amount"],
    "date_format": "MM/DD/YYYY"
  }
}
```

## Index Strategy

### Performance Indexes
- Composite indexes on (clinic_id, date) for time-series queries
- Provider-specific indexes for filtering
- Metric type indexes for categorization

### Unique Constraints
- User-clinic combinations in role mappings
- Clinic-spreadsheet pairs for connection uniqueness
- Aggregation uniqueness for data integrity

## Migration Notes

### Phase 1 Characteristics
- **Additive Only**: No modifications to existing tables
- **No Foreign Keys**: Relationships will be added in Phase 3
- **Nullable References**: All references to existing tables are nullable
- **String IDs**: Using CUID format to match existing schema

### Data Population Strategy
1. System templates can be seeded immediately
2. Historical metrics can be backfilled from spreadsheets
3. Aggregations should be computed after initial data load
4. Credentials require user OAuth flow

### Testing Checklist
- [ ] All tables created successfully
- [ ] Indexes are being used by queries
- [ ] No impact on existing functionality
- [ ] CRUD operations work for each table
- [ ] Performance baselines established

## Future Considerations

### Phase 3 Additions
- Foreign key constraints to existing tables
- Referential integrity enforcement
- Cascade rules implementation

### Phase 4 Changes
- UUID migration for all ID fields
- Supabase auth.users integration
- RLS policy implementation

### Performance Optimizations
- Partitioning for large metric tables
- Materialized views for complex aggregations
- Archive strategy for old data
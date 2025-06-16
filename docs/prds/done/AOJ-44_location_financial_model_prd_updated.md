# PRD: Location-based Financial Data Model Implementation (AOJ-44) - Updated

## Summary

This document outlines the requirements for implementing a comprehensive location-based financial data model within the dental dashboard application. **Critical Update**: The current system has NO location-specific financial data in the database. Previous assumptions about `verifiedProductionHumble` and `verifiedProductionBaytown` being location data were incorrect - these are provider production fields. This feature will implement a proper Location entity, Provider-Location relationships, and LocationFinancial model with Google Apps Script integration for automated data synchronization. This is a foundational requirement that blocks AOJ-41 (Providers Main Page) and AOJ-35 (KPI Calculations).

## Priority & Timeline Assessment

**Priority:** High (Critical Blocker)
- **Blocks:** AOJ-41 (Providers Main Page), AOJ-35 (KPI Calculations)
- **Enables:** Location-specific analytics, multi-location provider support, enhanced financial reporting
- **Timeline:** 6-8 weeks (reduced from original estimate due to strong existing foundation)
- **Complexity:** Complex (triggers AI guardrails due to schema changes, multi-file impact, and dependencies)

**Due Date Recommendation:** 8 weeks from start date
**Labels:** feature, database-schema, high-priority, blocker

## User Stories

**US1:** As a Clinic Administrator, I want to view detailed financial reports (production, collections, adjustments) for each specific clinic location, so that I can accurately assess the financial health and performance of individual sites.

**US2:** As a System Administrator, I need proper Location entities with normalized relationships, so that the system can support multi-location clinics with proper data integrity and scalability.

**US3:** As a Provider, I want my performance metrics to be accurately tracked across multiple locations where I work, so that my contributions to each location are properly recognized and measured.

**US4:** As a Data Manager, I want daily financial data from Google Sheets to be automatically synced into the system for each clinic location via Google Apps Script with multi-clinic support, so that location-specific financial data is current, accurate, and properly isolated by clinic entity.

**US5:** As a Developer building AOJ-41, I need location-aware provider queries and performance metrics, so that the Providers Main Page can display meaningful location-specific analytics.

## Functional Expectations

### 3.1. Location Entity (Foundation)

**New Location Model:**
```prisma
model Location {
  id          String   @id @default(cuid())
  clinicId    String   @map("clinic_id")
  name        String   // "Baytown", "Humble"
  address     String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  financials  LocationFinancial[]
  providers   ProviderLocation[]
  
  @@index([clinicId])
  @@unique([clinicId, name]) // Prevent duplicate location names per clinic
  @@map("locations")
}
```

### 3.2. Provider-Location Relationships (Critical for AOJ-41)

**New ProviderLocation Model:**
```prisma
model ProviderLocation {
  id         String   @id @default(cuid())
  providerId String   @map("provider_id")
  locationId String   @map("location_id")
  isActive   Boolean  @default(true) @map("is_active")
  startDate  DateTime @map("start_date")
  endDate    DateTime? @map("end_date")
  isPrimary  Boolean  @default(false) @map("is_primary") // Primary location for reporting
  
  provider   Provider @relation(fields: [providerId], references: [id])
  location   Location @relation(fields: [locationId], references: [id])
  
  @@unique([providerId, locationId])
  @@index([providerId])
  @@index([locationId])
  @@map("provider_locations")
}
```

### 3.3. Enhanced LocationFinancial Model

**Updated LocationFinancial Model:**
```prisma
model LocationFinancial {
  id              String   @id @default(cuid())
  clinicId        String   @map("clinic_id")
  locationId      String   @map("location_id")  // FK to Location instead of string
  date            DateTime
  production      Decimal  @db.Decimal(10, 2)
  adjustments     Decimal  @db.Decimal(10, 2)
  writeOffs       Decimal  @db.Decimal(10, 2)
  netProduction   Decimal  @db.Decimal(10, 2)  // Calculated field
  patientIncome   Decimal  @db.Decimal(10, 2)
  insuranceIncome Decimal  @db.Decimal(10, 2)
  totalCollections Decimal @db.Decimal(10, 2)  // Calculated field
  unearned        Decimal? @db.Decimal(10, 2)
  dataSourceId    String?  @map("data_source_id")
  createdBy       String?  @map("created_by")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  clinic          Clinic      @relation(fields: [clinicId], references: [id])
  location        Location    @relation(fields: [locationId], references: [id])
  dataSource      DataSource? @relation(fields: [dataSourceId], references: [id])
  
  @@index([clinicId, date])
  @@index([locationId, date])
  @@index([clinicId, locationId, date])
  @@unique([clinicId, locationId, date]) // Prevent duplicate entries
  @@map("location_financial")
}
```

### 3.4. API Endpoints

**Enhanced API Structure:**
- `GET /api/metrics/financial/locations` - List all location financial data with filtering
- `GET /api/metrics/financial/locations/{locationId}` - Get data for specific location (by ID, not name)
- `POST /api/metrics/financial/locations/import` - Import location financial data from Google Apps Script
- `GET /api/locations` - List all locations for a clinic
- `GET /api/providers/{providerId}/locations` - Get locations for a specific provider

### 3.5. Google Apps Script Integration (AOJ-46)

**Parallel Development with AOJ-46:**
- Google Apps Script will read location-specific financial data from designated sheets
- Transform and validate data before sending to import endpoint
- Handle multiple locations within single sheet or across multiple tabs
- Configured with proper authentication and error handling
- Automated triggers for regular synchronization

## Affected Files

**Database Schema:**
- `prisma/schema.prisma` - New Location, ProviderLocation, enhanced LocationFinancial models
- `prisma/migrations/` - Multiple migration files for schema changes

**API Endpoints:**
- `app/api/metrics/financial/locations/route.ts` - Location financial data endpoints
- `app/api/metrics/financial/locations/[locationId]/route.ts` - Specific location endpoint
- `app/api/metrics/financial/locations/import/route.ts` - Import endpoint for Google Apps Script
- `app/api/locations/route.ts` - Location management endpoints
- `app/api/providers/[providerId]/locations/route.ts` - Provider-location relationships

**Data Layer:**
- `lib/database/queries/locations.ts` - Location-specific queries
- `lib/database/queries/providers.ts` - Updated provider queries with location support
- `lib/database/schemas/location.ts` - Location validation schemas

**Migration Scripts:**
- `scripts/data-migration/create-locations.ts` - Create Location entities from existing data
- `scripts/data-migration/migrate-provider-locations.ts` - Establish provider-location relationships
- `scripts/data-migration/historical-financial-data.ts` - Migrate existing financial data

**Google Apps Script (AOJ-46):**
- `scripts/google-apps-script/location-financials-sync.gs` - Apps Script for data synchronization

## Implementation Strategy

### Phase 1: Enhanced Foundation (2-3 weeks)
1. **Location Entity Implementation**
   - Create Location model with proper relationships
   - Seed data for known locations (Humble, Baytown)
   - API endpoints for location management

2. **Provider-Location Relationships**
   - Implement ProviderLocation model
   - Create provider-location assignment logic
   - Update provider queries to support location context

### Phase 2: Financial Data Model (2-3 weeks)
1. **LocationFinancial Model**
   - Implement enhanced model with proper foreign keys
   - Add calculated fields and constraints
   - Create comprehensive validation logic

2. **API Endpoints**
   - Implement location financial data endpoints
   - Add import endpoint for Google Apps Script integration
   - Comprehensive error handling and validation

### Phase 3: Data Integration (2-3 weeks)
1. **Google Apps Script Development** (Parallel with AOJ-46)
   - Develop Apps Script for data synchronization
   - Configure authentication and error handling
   - Set up automated triggers

2. **Historical Data Migration**
   - Analyze existing data structures
   - Develop migration scripts with dry-run capability
   - Execute migration with comprehensive validation

### Phase 4: AOJ-41 Readiness (1-2 weeks)
1. **Provider Page Support**
   - Location-aware provider queries
   - Multi-location provider performance metrics
   - Integration testing with provider analytics

2. **KPI Foundation for AOJ-35**
   - Location-based aggregation functions
   - Performance optimization for reporting queries
   - Validation of KPI calculation accuracy

## AI Guardrails Implementation Strategy

**File-Level Constraints:**
- Limit changes to one model per migration file
- Separate API endpoint implementations into focused files
- Isolate migration scripts by functionality

**Change Type Isolation:**
- Database schema changes in dedicated migration files
- API endpoint changes in separate route files
- Data migration logic in isolated scripts

**Incremental Validation Protocol:**
- Unit tests for each new model and relationship
- Integration tests for API endpoints
- Migration validation with rollback procedures
- Performance testing for location-based queries

**Safety Prompts for AI Sessions:**
- Always backup database before schema changes
- Run migration scripts in dry-run mode first
- Validate data integrity after each migration step
- Test provider-location relationships thoroughly before AOJ-41 integration

## Risk Assessment & Mitigation

**High-Risk Areas:**
1. **Data Migration Complexity**
   - Risk: Loss of historical data or relationships
   - Mitigation: Comprehensive backup strategy, dry-run testing, rollback procedures

2. **Provider-Location Relationship Modeling**
   - Risk: Incorrect provider assignments affecting AOJ-41
   - Mitigation: Thorough validation, manual verification of provider assignments

3. **Performance Impact**
   - Risk: Location-based queries affecting system performance
   - Mitigation: Comprehensive indexing strategy, query optimization, performance testing

4. **Dependency Coordination**
   - Risk: Blocking AOJ-41 and AOJ-35 development
   - Mitigation: Clear milestone definitions, parallel development where possible

**Mitigation Strategies:**
- Phased rollout with validation at each step
- Comprehensive testing strategy (unit, integration, performance)
- Clear rollback procedures for each phase
- Regular stakeholder communication on progress and blockers

## Phase Breakdown

**Phase 1: Foundation (Weeks 1-3)**
- Location entity and relationships
- Provider-location assignments
- Basic API endpoints
- **Milestone:** Location infrastructure ready for financial data

**Phase 2: Financial Data (Weeks 3-6)**
- LocationFinancial model implementation
- Import API endpoint
- Data validation and error handling
- **Milestone:** Financial data model ready for integration

**Phase 3: Integration (Weeks 5-8)**
- Google Apps Script development (parallel with AOJ-46)
- Historical data migration
- Performance optimization
- **Milestone:** Complete location-based financial system operational

**Phase 4: Enablement (Weeks 7-8)**
- AOJ-41 readiness validation
- AOJ-35 KPI foundation
- Final testing and optimization
- **Milestone:** Dependent issues unblocked and ready for development

## Additional Considerations

**Location Master Data Management:**
- Future location management UI for adding/editing locations
- Location deactivation workflow
- Location metadata expansion (address, contact info, etc.)

**Multi-Location Provider Support:**
- Primary location designation for reporting
- Location-specific provider scheduling (future enhancement)
- Cross-location provider performance analytics

**Scalability Considerations:**
- Database partitioning strategy for large datasets
- Caching strategy for location-based queries
- API rate limiting for import endpoints

**Integration Points:**
- AOJ-41: Provider performance by location
- AOJ-35: Location-based KPI calculations
- AOJ-46: Google Apps Script data synchronization
- Future: Location-specific goal setting and tracking

**Success Metrics:**
- All location entities properly created and seeded
- Provider-location relationships accurately established
- LocationFinancial data successfully imported and validated
- AOJ-41 and AOJ-35 development unblocked
- Performance benchmarks met for location-based queries 
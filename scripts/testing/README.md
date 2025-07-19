# Testing Scripts

This directory contains scripts for testing various aspects of the Dental Dashboard application.

## Subdirectories

### Cloud Database (`cloud-database/`)
Scripts for testing cloud database connections and core functionality:

- **`test-app-with-cloud-db.ts`** - End-to-end application testing with cloud database
- **`test-cloud-database-connection.ts`** - Basic cloud database connectivity tests
- **`test-core-db-functionality.ts`** - Core database operation testing
- **`test-suite-with-cloud-db.ts`** - Comprehensive test suite using cloud database

### Integration (`integration/`)
Integration tests for multi-component functionality:

- **`provider-detection-fix-test.cjs`** - Tests for provider detection fixes
- **`test-dr-chinyere-detection-complete.cjs`** - Specific provider detection test case
- **`test-execute-sql-direct.cjs`** - Direct SQL execution testing
- **`test-execute-sql-endpoint.cjs`** - SQL endpoint API testing
- **`test-google-apps-script-suite.cjs`** - Google Apps Script integration testing
- **`test-location-implementation.ts`** - Location feature implementation tests
- **`test-multi-tenant-tables.ts`** - Multi-tenant database testing
- **`test-sync-resilience.ts`** - Data synchronization resilience testing
- **`test-results-gas.json`** - Google Apps Script test results

### Performance (`performance/`)
Performance testing and benchmarking:

- **`compare-db-performance.ts`** - Database performance comparison tools

### Validation (`validation/`)
Data validation and schema verification:

- **`validate-provider-schema.ts`** - Provider schema validation
- **`verify-provider-relationships.ts`** - Provider relationship validation
- **`verify-tables.js`** - Database table verification

## Usage

Run individual test scripts with appropriate Node.js or TypeScript runtime:

```bash
# TypeScript scripts
pnpm dlx tsx scripts/testing/cloud-database/test-core-db-functionality.ts

# JavaScript/CJS scripts  
node scripts/testing/integration/test-execute-sql-direct.cjs
```

## Environment

Most testing scripts use the cloud test database configured in `.env.test` for isolated testing.
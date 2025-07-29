# Scripts Documentation

This document provides comprehensive documentation for the Dental Dashboard project's script system, which has been reorganized for improved maintainability and clarity.

## Overview

The scripts directory has been transformed from a cluttered 50+ file structure into an organized, categorized system with clear responsibilities and documentation.

## Quick Reference

### Common Commands

```bash
# Development & Testing
pnpm test                    # Run test suite
pnpm test:watch             # Run tests in watch mode
pnpm test:gas               # Test Google Apps Script integration

# Database Operations
pnpm migrate:uuid           # Migrate to UUID primary keys
pnpm migrate:validate       # Validate migration integrity
pnpm sync:post-reseed      # Sync after database reseeding

# Deployment
pnpm gas:deploy            # Deploy Google Apps Script
pnpm gas:health            # Check GAS deployment health

# Code Quality & Security
pnpm null-safety:report    # Generate null safety report
pnpm security:scan         # Run security vulnerability scan
```

## Directory Structure

### 🧪 Testing (`scripts/testing/`)
Comprehensive testing infrastructure organized by scope:

**Cloud Database Testing** (`cloud-database/`)
- `test-app-with-cloud-db.ts` - End-to-end app testing with cloud database
- `test-cloud-database-connection.ts` - Cloud database connectivity validation
- `test-core-db-functionality.ts` - Core database operations testing
- `test-suite-with-cloud-db.ts` - Complete test suite with cloud infrastructure

**Integration Testing** (`integration/`)
- `test-google-apps-script-suite.cjs` - GAS integration testing
- `test-multi-tenant-tables.ts` - Multi-tenant architecture validation
- `test-sync-resilience.ts` - Data synchronization resilience testing
- Provider detection and SQL execution tests

**Performance Testing** (`performance/`)
- `compare-db-performance.ts` - Database performance benchmarking

**Validation Testing** (`validation/`)
- `validate-provider-schema.ts` - Provider schema validation
- `verify-provider-relationships.ts` - Relationship integrity verification

### 🗄️ Database (`scripts/database/`)
Complete database operations suite:

**Analysis** (`analysis/`)
- `analyze-seeding-issue.ts` - Database seeding diagnostics

**Data Migration** (`data-migration/`)
- `migrate-to-uuid.ts` - UUID migration system
- `migrate-historical-financial-data.ts` - Historical data migration
- `validate-migration.ts` - Migration integrity validation
- `rollback-uuid-migration.ts` - Safe migration rollback

**Schema Migrations** (`migrations/`)
- `apply-migrations-pg.ts` - PostgreSQL migration application
- `fix-provider-locations.ts` - Provider location relationship fixes

**Database Seeding** (`seeding/`)
- `seed-stable-codes.ts` - Stable identifier seeding
- `post-reseed-sync.ts` - Post-reseed synchronization
- `seed-kamdi-mappings.ts` - KamDental integration mappings

### 🐛 Debugging (`scripts/debugging/`)
Comprehensive debugging and analysis tools:

- `debug-provider-detection.cjs` - Provider detection debugging
- `debug-provider-relationships.ts` - Relationship analysis
- `null-safety-report.js` - Null safety violation reporting
- `scan-contamination.js` - Test data contamination detection
- `security-scan.js` - Security vulnerability scanning

### 🚀 Deployment (`scripts/deployment/`)
Production deployment infrastructure:

**Google Apps Script Deployment**
- `deploy-gas.cjs` - Main GAS deployment utility
- `gas-health-check.cjs` - Deployment health monitoring
- Complete sync implementations for dentist, hygienist, and location data
- Multi-provider support with shared utilities

**Supabase Deployment** (`supabase/`)
- `apply-sql-functions.ts` - SQL function deployment
- `apply-supabase-migrations.sh` - Supabase migration management

### 🛠️ Utilities (`scripts/utilities/`)
Shared utility functions:

- `safety-utils.js` - Environment validation and safe operations
- `test-runner.js` - Enhanced test execution with reporting

## Script Naming Conventions

All scripts follow **kebab-case** naming conventions as per project standards:
- ✅ `migrate-to-uuid.ts`
- ✅ `test-sync-resilience.ts`
- ✅ `debug-provider-detection.cjs`
- ❌ `MigrateToUuid.ts` (PascalCase)
- ❌ `test_sync_resilience.ts` (snake_case)

## Environment Safety

### Database Environment Protection
Scripts include comprehensive environment validation to prevent accidental operations on production:

```typescript
import { validateTestEnvironment } from '@/lib/utils/test-environment-guard';
validateTestEnvironment(); // Throws if production detected
```

### Cloud Testing Infrastructure
- All tests use cloud Supabase branch database (`.env.test`)
- No local database dependencies in CI/CD
- Isolated testing environment prevents production contamination

## Usage Patterns

### Database Operations
```bash
# Migration workflow
pnpm migrate:uuid           # Execute migration
pnpm migrate:validate       # Validate results
# If issues found:
pnpm migrate:rollback       # Safe rollback

# Post-seeding workflow
pnpm prisma:seed           # Seed database
pnpm sync:post-reseed      # Sync external systems
```

### Testing Workflow
```bash
# Local development testing
pnpm test                  # Run full test suite
pnpm test:watch           # Development mode

# Integration testing
pnpm test:gas             # Test GAS integration
pnpm test:integration     # Run integration tests

# Performance validation
tsx scripts/testing/performance/compare-db-performance.ts
```

### Deployment Workflow
```bash
# Google Apps Script deployment
pnpm gas:deploy           # Deploy all GAS applications
pnpm gas:health           # Verify deployment health

# Selective deployment
pnpm gas:deploy:dentist   # Deploy dentist sync only
pnpm gas:deploy:hygienist # Deploy hygienist sync only
```

### Debugging Workflow
```bash
# Code quality analysis
pnpm null-safety:report   # Check null safety violations
pnpm security:scan        # Security vulnerability scan

# Data integrity analysis
tsx scripts/debugging/debug-provider-relationships.ts
tsx scripts/debugging/scan-contamination.js
```

## Integration with Development Workflow

### Package.json Integration
All scripts are integrated with the package.json scripts section for easy access:
- Testing scripts → `pnpm test*` commands
- Database operations → `pnpm migrate*` and `pnpm sync*` commands
- Deployment → `pnpm gas*` commands
- Code quality → `pnpm null-safety*` and `pnpm security*` commands

### IDE Integration
- Scripts are organized in logical directories for easy IDE navigation
- README files in each directory provide context and usage instructions
- Consistent naming makes script discovery intuitive

### CI/CD Integration
- Scripts support automated execution in GitHub Actions
- Cloud database testing ensures consistent CI/CD environment
- Environment validation prevents accidental production operations

## Maintenance Guidelines

### Adding New Scripts
1. **Choose the correct directory** based on script purpose
2. **Follow kebab-case naming** conventions
3. **Include environment validation** for safety
4. **Add package.json entry** if commonly used
5. **Update relevant README** files
6. **Include TSDoc comments** for exported functions

### Modifying Existing Scripts
1. **Maintain backward compatibility** where possible
2. **Update package.json paths** if files are moved
3. **Update documentation** to reflect changes
4. **Test changes** in development environment first

### Directory Organization Principles
- **Purpose-based grouping** - scripts grouped by primary function
- **Clear separation** - testing vs. production operations
- **Environment safety** - development vs. production script separation
- **Consistent documentation** - README in every directory

## Migration from Old Structure

The reorganization transformed:
- **50+ files** in scripts root → **6 organized directories**
- **Mixed naming conventions** → **Consistent kebab-case**
- **No documentation** → **Comprehensive README files**
- **Ad-hoc organization** → **Logical categorical structure**

### Benefits Achieved
- ✅ **Improved discoverability** - logical organization makes finding scripts intuitive
- ✅ **Enhanced maintainability** - clear separation of concerns and documentation
- ✅ **Better developer experience** - README files provide context and usage
- ✅ **Reduced cognitive load** - organized structure reduces mental overhead
- ✅ **Consistent naming** - kebab-case throughout improves predictability
- ✅ **Scalable structure** - easy to add new scripts in appropriate categories

This reorganization transforms the scripts directory from cluttered and confusing to organized and maintainable, supporting the project's long-term development needs.
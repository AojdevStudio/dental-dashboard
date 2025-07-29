# Deployment Scripts

This directory contains scripts and configurations for deploying various components of the Dental Dashboard application.

## Structure

### Google Apps Script (`google-apps-script/`)
Comprehensive Google Apps Script deployment system with multiple sync implementations:

#### Core Deployment
- **`deploy-gas.cjs`** - Main Google Apps Script deployment utility
- **`gas-health-check.cjs`** - Health check for deployed GAS applications

#### Sync Implementations
- **`deploy-dentist-sync-v2.1-multi-provider/`** - Multi-provider dentist data synchronization
- **`deploy-hygienist-sync-v2/`** - Hygienist-specific data synchronization  
- **`location-financials-sync/`** - Location financial data synchronization
- **`examples/`** - Example implementations and templates

#### Shared Utilities
- **`shared-multi-provider-utils.gs`** - Shared utilities for multi-provider functionality
- **`shared-sync-utils.gs`** - Common synchronization utilities

### Supabase (`supabase/`)
Supabase-specific deployment tools:

- **`apply-sql-functions.ts`** - Deploys SQL functions to Supabase
- **`apply-supabase-migrations.sh`** - Applies Supabase migrations

## Usage

### Google Apps Script Deployment
```bash
# Deploy Google Apps Script
node scripts/deployment/deploy-gas.cjs

# Check GAS health
node scripts/deployment/gas-health-check.cjs
```

### Supabase Deployment
```bash
# Apply SQL functions
pnpm dlx tsx scripts/deployment/supabase/apply-sql-functions.ts

# Apply migrations
bash scripts/deployment/supabase/apply-supabase-migrations.sh
```

## Configuration

- Google Apps Script deployments require proper authentication and project setup
- Supabase deployments use environment variables for database connections
- See individual subdirectory README files for specific configuration requirements

## Documentation

Each deployment subdirectory contains detailed documentation:
- `google-apps-script/` - Contains comprehensive implementation guides and dependency documentation
- See `README-GAS-DEPLOYMENT.md` for Google Apps Script deployment overview
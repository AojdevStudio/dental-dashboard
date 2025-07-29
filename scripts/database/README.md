# Database Scripts

This directory contains scripts for database operations, migrations, and data management.

## Subdirectories

### Analysis (`analysis/`)
Database diagnostic and analysis tools:

- **`analyze-seeding-issue.ts`** - Analyzes and diagnoses database seeding problems

### Data Migration (`data-migration/`)
Scripts for migrating data between schema versions:

- **`create-locations.ts`** - Creates location records during migration
- **`migrate-historical-financial-data.ts`** - Migrates historical financial data
- **`migrate-to-uuid.ts`** - Migrates database to use UUID primary keys
- **`rollback-uuid-migration.ts`** - Rolls back UUID migration if needed
- **`validate-migration.ts`** - Validates data integrity after migrations

### Migrations (`migrations/`)
Database schema migration utilities:

- **`apply-migrations-pg.ts`** - Applies PostgreSQL migrations
- **`fix-provider-locations.ts`** - Fixes provider location relationships
- **`populate-uuids.ts`** - Populates UUID fields in existing records

### Seeding (`seeding/`)
Database seeding and initial data setup:

- **`post-reseed-sync.ts`** - Synchronization tasks after database reseeding
- **`seed-kamdi-mappings.ts`** - Seeds KamDental integration mappings
- **`seed-stable-codes.ts`** - Seeds stable identifier codes

## Usage

### Migration Scripts
```bash
# Run TypeScript migration
pnpm dlx tsx scripts/database/migrations/apply-migrations-pg.ts

# Run data migration
pnpm dlx tsx scripts/database/data-migration/migrate-to-uuid.ts
```

### Seeding Scripts
```bash
# Seed stable codes
pnpm dlx tsx scripts/database/seeding/seed-stable-codes.ts

# Post-reseed synchronization
pnpm dlx tsx scripts/database/seeding/post-reseed-sync.ts
```

## Safety Notes

- Always backup production data before running migration scripts
- Test migrations on development/staging environments first
- Validate data integrity after running migrations
- Some scripts may require specific environment variables

## Environment Protection

Scripts include environment validation to prevent accidental execution against production databases.
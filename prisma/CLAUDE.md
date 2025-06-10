# Utilizing Prisma Tools

When the user mentions "Prisma MCP" or requests actions related to Prisma database management, migrations, or data inspection, you should consider using the available Prisma tools. These tools provide direct ways to interact with the Prisma setup of the project.

## Available Prisma Tools

Here's a list of the Prisma tools at your disposal and their typical use cases:

-   **`mcp_Prisma_Prisma-Studio(projectCWD: str)`**
    -   **Purpose:** Opens Prisma Studio, a visual UI for browsing and managing data in the database.
    -   **When to use:**
        -   When the user wants to visually inspect data in tables (e.g., to verify seeding, check results of operations).
        -   For manual data exploration or light modifications during development.
        -   Useful for debugging data-related issues.
    -   **Example:** After a seeding operation, if the user questions whether data was correctly added, you can offer to open Prisma Studio for them to check.

-   **`mcp_Prisma_migrate-status(projectCWD: str)`**
    -   **Purpose:** Checks the status of database migrations. Shows which migrations have been applied, which are pending, and if there's any drift between the migration history and the database schema.
    -   **When to use:**
        -   Before running new migrations to understand the current state.
        -   When troubleshooting migration-related errors.
        -   If the user asks about the migration status.

-   **`mcp_Prisma_migrate-dev(name: str, projectCWD: str)`**
    -   **Purpose:** Creates a new migration based on changes in `schema.prisma` and applies it to the development database. Also runs pending migrations.
    -   **When to use:**
        -   After you or the user has modified `schema.prisma` and new database schema changes need to be persisted and applied.
        -   Always provide a descriptive `name` for the migration (e.g., "add_user_email_verification_token").

-   **`mcp_Prisma_migrate-reset(projectCWD: str)`**
    -   **Purpose:** Resets the development database, dropping all data and reapplying all migrations. Useful for getting a clean state.
    -   **When to use:**
        -   **Caution:** This is a destructive operation for development databases.
        -   When the database is in an inconsistent state and needs a fresh start.
        -   If migration history drift is detected and cannot be easily resolved.
        -   Always confirm with the user before using, explaining it will wipe development data.

-   **`mcp_Prisma_Prisma-Login(projectCWD: str)`**
    -   **Purpose:** Allows the user to log in to their Prisma account or create one. This is often a prerequisite for using Prisma Platform features like Prisma Accelerate or Pulse.
    -   **When to use:**
        -   If operations requiring Prisma Platform authentication fail.
        -   If the user needs to connect to Prisma's online services.

-   **`mcp_Prisma_Prisma-Postgres-account-status(projectCWD: str)`**
    -   **Purpose:** Shows the status of the Prisma Postgres account, indicating if the user is logged in.
    -   **When to use:**
        -   To check if login is required before attempting to use Prisma Platform features.

-   **`mcp_Prisma_Create-Prisma-Postgres-Database(name: str, projectCWD: str, region: str)`**
    -   **Purpose:** Creates a new online Prisma Postgres database via the Prisma Platform.
    -   **When to use:**
        -   If the user wants to set up a new cloud-hosted Postgres database managed by Prisma.
        -   Requires the user to be logged into Prisma Platform.
        -   Specify a sensible `name` and `region` (default to `us-east-1` if unsure).

## General Guidelines

-   Always provide the `projectCWD` (current working directory, typically the workspace root) when calling these tools.
-   Explain to the user *why* you are using a specific Prisma tool and what it's expected to do.
-   Interpret the results or any error messages from the tools to the user.
-   If a tool is destructive (like `migrate-reset`), ensure user confirmation.

# Prisma Database Seeding

Guidelines for properly seeding the database with initial data using Prisma.

## Seed Command

**Always use this exact command to run the seed file:**

```bash
pnpm dlx tsx prisma/seed.ts
```

**Do NOT use:**
- `npx prisma db seed` (may not work without proper package.json configuration)
- `pnpm prisma db seed` (requires seed script in package.json)
- Direct node execution (TypeScript files need compilation)

## Why This Command Works

- **`pnpm dlx`**: Downloads and executes packages without installing them globally
- **`tsx`**: TypeScript execution engine that handles `.ts` files directly
- **`prisma/seed.ts`**: Direct path to the seed file

## Seed File Requirements

The seed file at @prisma/seed.ts should:

1. **Import Prisma Client** from the generated location:
   ```typescript
   import { PrismaClient } from '../src/generated/prisma'
   ```

2. **Use upsert operations** for idempotent seeding:
   ```typescript
   await prisma.clinic.upsert({
     where: { registrationCode: 'UNIQUE-CODE' },
     update: { /* update data */ },
     create: { /* create data */ }
   })
   ```

3. **Handle errors gracefully**:
   ```typescript
   main()
     .catch((e) => {
       console.error('❌ Seeding failed:', e)
       process.exit(1)
     })
     .finally(async () => {
       await prisma.$disconnect()
     })
   ```

## Pre-Seeding Checklist

Before running the seed command:

1. **Ensure schema is synchronized**:
   ```bash
   pnpm prisma db push
   ```

2. **Generate Prisma Client**:
   ```bash
   pnpm prisma generate
   ```

3. **Check database connection** in `.env` file

## Seeding Best Practices

- **Idempotent Operations**: Use `upsert` instead of `create` to allow re-running
- **Logical Ordering**: Seed parent entities before children (clinics before providers)
- **Error Handling**: Wrap operations in try-catch blocks
- **Logging**: Include clear console output for tracking progress
- **Permissions**: Include database permission grants for service roles

## Common Issues

### Issue: "Cannot find module" error
**Solution**: Ensure Prisma Client is generated:
```bash
pnpm prisma generate
```

### Issue: Schema drift errors
**Solution**: Synchronize schema first:
```bash
pnpm prisma db push
```

### Issue: Permission denied errors
**Solution**: Check database connection and credentials in `.env`

## Example Seed Structure

```typescript
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  
  // 1. Seed clinics (parent entities)
  const clinics = await seedClinics()
  
  // 2. Seed users
  const users = await seedUsers()
  
  // 3. Seed providers (child entities)
  const providers = await seedProviders(clinics)
  
  // 4. Apply permissions
  await applyDatabasePermissions()
  
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Integration with Development Workflow

1. **After schema changes**: Run `pnpm prisma db push` then seed
2. **Fresh database setup**: Run migrations, then seed
3. **Testing**: Seed before running integration tests
4. **Development reset**: Reset database, then re-seed for clean state

# Prisma Usage

## Data Access Policy

- **Prisma is our exclusive data access method** for all database operations
- Supabase Data API (PostgREST) has been disabled in the project settings
- Direct SQL queries should be avoided unless absolutely necessary
- All database interactions must go through service layers that use Prisma

## Basic Usage

We use Supabase PostgreSQL as our database provider.

Import Prisma in the project:

```typescript
import prisma from "@/utils/prisma";
```

The Prisma schema is located at: `dental-dashboard/prisma/schema.prisma`.

## Schema Updates

### Fast Development Updates

For faster development workflows, use the shortcut command:

```bash
pnpm prisma:push
```

This custom script runs `prisma db push` and offers these benefits:
- It's significantly faster for iterative development
- Requires less typing than the full command
- Avoids creating migration history files when you're just iterating on schema changes
- Immediately syncs your database with schema changes

### Production/Versioned Updates

For tracked schema changes (recommended for production or when changes need to be versioned):

```bash
pnpm prisma migrate dev --name your_descriptive_name
```

This creates proper migration files that can be tracked in version control and safely applied in production environments.

## Best Practices

- Use Prisma's type-safe queries to ensure data integrity
- Implement complex database operations in service files under `src/services/`
- Always handle potential errors from Prisma queries
- Use transactions for operations that modify multiple records
- Keep schema migrations in version control

## Examples

### Reading Data with Relations

```typescript
// In a service file
export async function getClinicWithProviders(id: string) {
  return prisma.clinic.findUnique({
    where: { id },
    include: {
      providers: {
        include: {
          // Nested relation - providers with their appointments
          appointments: {
            where: {
              date: { gte: new Date() } // Only future appointments
            },
            orderBy: { date: 'asc' }
          }
        }
      }
    }
  });
}
```

### Filtering Relations
```typescript
    // In a service file
export async function getActiveProviders(clinicId: string) {
  return prisma.provider.findMany({
    where: {
      clinicId,
      status: 'ACTIVE',
      // Find providers who have at least one upcoming appointment
      appointments: {
        some: {
          date: { gte: new Date() }
        }
      }
    },
    select: {
      id: true,
      name: true,
      type: true,
      // Include counts directly in the query
      _count: {
        select: { appointments: true }
      }
    }
  });
}
```

### Transactions
```typescript
// For operations that should succeed or fail together
export async function transferPatient(patientId: string, fromProviderId: string, toProviderId: string) {
  return prisma.$transaction(async (tx) => {
    // Get the current patient data
    const patient = await tx.patient.findUnique({
      where: { id: patientId },
      include: { appointments: true }
    });
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Update patient's provider
    await tx.patient.update({
      where: { id: patientId },
      data: { providerId: toProviderId }
    });
    
    // Update appointment assignments
    await tx.appointment.updateMany({
      where: { 
        patientId,
        providerId: fromProviderId,
        status: 'SCHEDULED'
      },
      data: { providerId: toProviderId }
    });
    
    // Create a record of the transfer
    await tx.patientTransferLog.create({
      data: {
        patientId,
        fromProviderId,
        toProviderId,
        transferredAt: new Date()
      }
    });
  });
}
```

By following these guidelines, we ensure consistent data access patterns and maintain our server-first architecture.
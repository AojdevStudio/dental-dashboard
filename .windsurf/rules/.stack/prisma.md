---
trigger: model_decision
description: Prisma usage guidelines for data access
globs: 
---
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
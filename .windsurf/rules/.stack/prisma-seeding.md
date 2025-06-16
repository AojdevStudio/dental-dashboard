---
trigger: model_decision
description: Guidelines for properly seeding the database with initial data using Prisma.
globs: 
---
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

The seed file at [prisma/seed.ts](mdc:prisma/seed.ts) should:

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

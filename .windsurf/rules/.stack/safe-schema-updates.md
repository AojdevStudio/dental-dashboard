---
trigger: model_decision
description: When updating Schema
globs: 
---
# Safe Schema Updates

When extending or modifying the database schema in an existing application, follow these guidelines to ensure data integrity and minimize disruption.

## 1. Adding Fields to Existing Tables

When adding fields to tables that already contain data:

- Make new fields nullable (`String?` instead of `String`) so existing records don't require values
- Provide default values for non-nullable fields using `@default(value)`
- Place new fields at the end of the model definition for better readability

Example:
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String
  
  // New fields added safely
  lastLogin DateTime? @map("last_login")  // Nullable
  isActive  Boolean   @default(true)      // Has default
}
```

## 2. Create-Only Migrations

Use the `--create-only` flag when you need to customize the migration before applying it:

```bash
pnpm dlx prisma migrate dev --name add_source_tracking --create-only
```

This allows you to:
- Review and modify the SQL before execution
- Add data transformations
- Split changes into multiple statements

## 3. Testing Schema Changes

Before applying migrations to production:
- Test migrations on a copy of production data
- Verify both forward and rollback procedures
- Check for performance impacts on large tables

## 4. Relation Field Updates

When changing relation fields:
- First make the field optional before removing it
- Use multiple migrations for complex relationship changes
- Consider data integrity across all related tables

## 5. Data Migration Patterns

For complex data transformations:
- Use raw SQL in migrations when Prisma operations would be inefficient
- Consider background jobs for time-consuming migrations
- Keep atomic operations together within transactions


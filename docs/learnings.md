## Prisma Commands

- pnpm prisma:generate - to generate the Prisma client
- pnpm prisma:push - to push the Prisma schema to the database
- pnpm prisma:studio - to start the Prisma Studio
- pnpm prisma:migrate - to migrate the database

## Next.js Commands

- pnpm dev - to start the development server
- pnpm build - to build the production application
- pnpm start - to start the production application


## Biome Commands

- pnpm lint - to check for linting issues
- pnpm lint:fix - to check and fix linting issues
- pnpm format - to format your code

## Mermaid Commands
To view Mermaid diagrams in Cursor:

1. Open your .md or .mmd file with Mermaid code blocks
2. Open preview:
   - Use Command Palette (Ctrl/Cmd + Shift + P)
   - Select "Markdown: Open Preview"
   - Or click preview button in editor
3. View diagram in preview pane
4. Edit code to update diagram in real-time

## Configuring PNPM workspace

```bash
engine-strict=true
use-pnpm=true
auto-install-peers=true
strict-peer-dependencies=false
```
## Repomix Commands

- pnpm dlx repomix --include "src/**/*.ts,**/*.md"
- pnpm dlx repomix

### Migrations
# Prisma Migration Commands - Quick Reference

Here are the simple commands for managing Prisma schema changes and migrations:

## Basic Migration Workflow

1. **Create & Apply Migration (recommended approach)**
   ```bash
   pnpm prisma:push
   ```
   This command:
   - Creates a migration file based on schema changes
   - Applies it to your database
   - Regenerates the Prisma client

2. **Direct Push (for development/prototyping)**
   ```bash
   # Push schema changes directly without migration history
   pnpm prisma db push
   ```
   This is faster for rapid iteration but doesn't track migration history.

## Other Useful Commands

3. **View Database Status**
   ```bash
   # Compare current schema against database
   pnpm prisma migrate status
   ```

4. **Apply Migrations in Production**
   ```bash
   # Apply pending migrations in production (no schema changes)
   pnpm prisma migrate deploy
   ```

5. **Reset Database (⚠️ destructive)**
   ```bash
   # Drop all tables and reapply all migrations
   pnpm prisma migrate reset
   ```

6. **Regenerate Client**
   ```bash
   # Regenerate Prisma client after schema changes
   pnpm prisma generate
   ```

The main difference between `migrate dev` and `db push` is that `migrate dev` creates migration files in your version control that track the history of changes, while `db push` directly updates the database schema without tracking history.

# Short Coding Rules

## Quick Reference Guide

### Bash Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build production app
pnpm start                  # Start production server

# Code Quality (MANDATORY - All must pass)
pnpm format                 # Format code with Biome
pnpm test                   # Run unit tests
pnpm typecheck             # TypeScript type checking
pnpm biome:check           # Linting + formatting check
pnpm lint                  # Next.js ESLint
pnpm code-quality          # Full pipeline (format + test + build)

# Database
pnpm prisma:generate       # Generate Prisma client
pnpm prisma:push          # Push schema changes (dev)
pnpm prisma:studio        # Open Prisma Studio
pnpm dlx tsx prisma/seed.ts  # Seed database

# Git Security Check
git status                 # ALWAYS run before committing
```

### Code Style
- Use consistent indentation (2 spaces)
- Follow project-specific naming conventions
- Include JSDoc comments for public functions
- Write unit tests for new functionality
- Follow the principle of single responsibility
- Use descriptive variable and function names

### Git Workflow
- Use feature branches for new development
- Write descriptive commit messages
- Reference issue numbers in commits and PRs
- Keep commits focused and atomic
- Rebase feature branches on main before PR
- Squash commits when merging to main

### Project Structure
- `/src`: Source code
- `/tests`: Test files (E2E)
- `/docs`: Documentation
- `/scripts`: Build and utility scripts
- `/types`: Type definitions

### Critical Rules
- **NO `any` type** - Use proper types always
- **NO `.env` in git** - Use environment variables
- **NO `git add .`** - Add files explicitly
- **Delete old code** - Don't keep commented code
- **500 line limit** - Split large files
- **Tests required** - For business logic

### Naming Conventions
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Routes: `kebab-case/`
- Database: `snake_case`
- Test files: `file.test.ts`
- Docs: `kebab-case.md`

### Required Checks Before PR
- All tests pass  
- TypeScript has no errors  
- Biome formatting clean  
- No secrets in code  
- Feature works end-to-end
# Dev Agent Command Execution Guidelines

## CRITICAL: Package Manager Usage

**ALWAYS use `pnpm` as the package manager for this project. NEVER use `npm` or `yarn`.**

### Primary Commands
```bash
# ✅ CORRECT - Always use pnpm
pnpm install                    # Install dependencies
pnpm add [package]             # Add new dependency
pnpm dev                       # Start development server
pnpm build                     # Build for production
pnpm test                      # Run tests
pnpm lint                      # Run linting
pnpm typecheck                 # Run TypeScript checks

# ❌ WRONG - Never use these
npm install                    # FORBIDDEN
npm run dev                    # FORBIDDEN
yarn install                   # FORBIDDEN
```

## Code Quality Commands

### Biome (Primary Linter/Formatter)
```bash
# ✅ Use these pnpm scripts for Biome
pnpm biome:check              # Check all issues
pnpm biome:fix                # Auto-fix all issues
pnpm biome:format             # Format code only
pnpm biome:lint               # Lint only
pnpm imports:fix              # Fix import organization
```

### Quality Pipeline
```bash
# ✅ Full quality check before commits
pnpm pre-commit               # Biome + tests
pnpm code-quality             # Biome + tests + build
```

## Database Commands

### Prisma Operations
```bash
# ✅ Always use pnpm prefix for Prisma
pnpm prisma:generate          # Generate client
pnpm prisma:push              # Push schema (dev)
pnpm prisma:studio            # Open studio
pnpm prisma:seed              # Seed database
```

## Testing Commands

### Test Execution
```bash
# ✅ Use pnpm for all test commands
pnpm test                     # Run all tests
pnpm test:watch               # Watch mode
pnpm test:coverage            # With coverage
pnpm test:e2e                 # End-to-end tests
```

### Test Database
```bash
# ✅ Test database management
pnpm test:start               # Start local Supabase
pnpm test:stop                # Stop local Supabase
pnpm test:reset               # Reset test database
```

## Command Execution Rules

### 1. Always Check package.json First
Before running any command, verify it exists in package.json scripts:
```bash
# ✅ Check available scripts
pnpm run                      # List all scripts
```

### 2. Use pnpm Scripts Over Direct Commands
```bash
# ✅ PREFERRED - Use defined scripts
pnpm lint                     # Instead of: biome check
pnpm format                   # Instead of: biome format
pnpm typecheck                # Instead of: tsc --noEmit

# ✅ ACCEPTABLE - When no script exists
pnpm dlx tsx script.ts        # For running TypeScript files
pnpm exec biome --help        # For tool help/options
```

### 3. Package Installation
```bash
# ✅ Installing packages
pnpm add [package]            # Production dependency
pnpm add -D [package]         # Development dependency
pnpm add -g [package]         # Global (rare, avoid)

# ✅ Shadcn UI components
pnpm dlx shadcn@latest add [component]
```

### 4. Environment-Specific Commands
```bash
# ✅ Development
pnpm dev                      # Start dev server

# ✅ Production
pnpm build                    # Build for production
pnpm start                    # Start production server

# ✅ Database migrations
pnpm prisma migrate dev       # Create migration
pnpm prisma migrate deploy    # Deploy migrations
```

## Common Patterns

### Before Making Changes
1. `pnpm typecheck` - Verify TypeScript
2. `pnpm biome:check` - Check code quality
3. `pnpm test` - Run tests

### After Making Changes
1. `pnpm biome:fix` - Auto-fix issues
2. `pnpm test` - Verify tests pass
3. `pnpm build` - Verify build works

### Full Quality Check
```bash
pnpm code-quality             # Complete pipeline
```

## Error Resolution

### Common Issues
1. **"command not found"** → Use `pnpm` prefix
2. **"script not found"** → Check `pnpm run` for available scripts
3. **"package not found"** → Use `pnpm add [package]` to install

### Debugging Commands
```bash
pnpm list                     # Show installed packages
pnpm outdated                 # Check for updates
pnpm why [package]            # Why is package installed
```

## Integration with Dev Agent

### Command Resolution Priority
1. **Check if pnpm script exists** in package.json
2. **Use pnpm script** if available
3. **Use pnpm exec/dlx** for direct tool access
4. **Never default to npm/yarn**

### Context Awareness
- This project uses **pnpm@10.10.0** (specified in package.json)
- All documentation references use **pnpm** commands
- CI/CD pipelines expect **pnpm** usage
- Lock file is **pnpm-lock.yaml** (not package-lock.json)

## Quick Reference Card

| Task | Command | Notes |
|------|---------|-------|
| Install deps | `pnpm install` | Never use npm/yarn |
| Start dev | `pnpm dev` | Uses Turbopack |
| Run tests | `pnpm test` | With local Supabase |
| Check quality | `pnpm biome:check` | Linting + formatting |
| Fix issues | `pnpm biome:fix` | Auto-fix all |
| Type check | `pnpm typecheck` | TypeScript validation |
| Build | `pnpm build` | Production build |
| Add package | `pnpm add [pkg]` | Install dependency |
| Database | `pnpm prisma:*` | All Prisma operations |

---

**REMEMBER: When in doubt, use `pnpm` - it's the only package manager for this project.** 
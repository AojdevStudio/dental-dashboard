# Cloud Testing Setup Guide

## Overview

This project has transitioned from local Supabase testing to a cloud-only testing approach for improved CI/CD reliability and consistency.

## Testing Architecture

### Cloud Test Database
- **Environment**: Dedicated Supabase branch project for testing
- **Configuration**: All test configuration is in `.env.test`
- **URL**: `https://bxnkocxoacakljbcnulv.supabase.co`
- **Purpose**: Isolated testing environment separate from production

### Benefits of Cloud Testing

1. **Consistency**: Same environment in local development and CI/CD
2. **Performance**: No local database startup/teardown time
3. **Reliability**: Eliminates local Supabase service dependencies
4. **Simplicity**: Reduced CI/CD complexity and maintenance

## Test Configuration

### Environment Variables (.env.test)
```bash
# Cloud Supabase Test Database
DATABASE_URL="postgresql://postgres.bxnkocxoacakljbcnulv:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.bxnkocxoacakljbcnulv:***@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Cloud Supabase Test Configuration  
NEXT_PUBLIC_SUPABASE_URL="https://bxnkocxoacakljbcnulv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="***"
SUPABASE_SERVICE_KEY="***"
```

### Test Scripts
- `pnpm test` - Run tests against cloud database
- `pnpm test:watch` - Watch mode with cloud database
- `pnpm test:coverage` - Coverage report with cloud database
- `pnpm test:cloud` - Display cloud database information

## Development Workflow

### Running Tests Locally
1. Ensure `.env.test` is properly configured
2. Run `pnpm test` to execute tests against cloud database
3. No local Supabase setup required

### CI/CD Pipeline
- GitHub Actions uses cloud database secrets
- No local database services in CI
- Faster test execution
- Consistent test environment

## Migration from Local Supabase

### Removed Dependencies
- ❌ `test:start` - No longer needed (was `pnpm supabase start`)
- ❌ `test:stop` - No longer needed (was `pnpm supabase stop`) 
- ❌ `test:reset` - No longer needed (was local database reset)
- ❌ Local database lifecycle management in test runner

### Updated Components
- ✅ Test runner now verifies cloud connection
- ✅ Vitest setup uses cloud database configuration
- ✅ GitHub Actions workflow uses cloud database secrets
- ✅ Documentation updated to reflect cloud-only approach

## Troubleshooting

### Connection Issues
If tests fail to connect to cloud database:

1. **Check Environment**: Verify `.env.test` configuration
2. **Test Connection**: Run `pnpm exec prisma db ping`
3. **Verify Secrets**: Ensure GitHub secrets are properly configured for CI

### Test Data Management
- Cloud test database is isolated from production
- Test data is managed through Prisma seeding
- Database state is reset between test runs as needed

## Security Considerations

### Environment Isolation
- **Production**: Real clinic data (`supabase.co` production URLs)
- **Test**: Isolated test data (cloud branch database)
- **Development**: Uses production database with proper access controls

### Access Control
- Test database has separate access keys
- No production data in test environment
- Proper authentication and authorization in all environments

## Future Enhancements

### Planned Improvements
- Automated test data seeding strategies
- Performance monitoring for cloud test database
- Additional testing environments (staging)
- Enhanced test isolation mechanisms
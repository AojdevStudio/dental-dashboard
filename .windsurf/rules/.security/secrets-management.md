---
trigger: model_decision
description: 
globs: 
---
# Secrets Management Best Practices

## Overview

This rule defines security standards for managing API keys, credentials, and other sensitive information in the dental dashboard project. Based on [GitGuardian's secrets management best practices](mdc:https:/blog.gitguardian.com/secrets-api-management/?utm_source=product&utm_medium=GitHub_checks&utm_campaign=check_run_comment).

## Core Principles

### 1. Never Store Unencrypted Secrets in Git Repositories

**Critical Rule**: If a secret enters a repository (private or public), it should be considered compromised.

- ❌ **Never** commit API keys, database passwords, or tokens directly to code
- ❌ **Never** use `git add *` or `git add .` commands without careful review
- ✅ **Always** add sensitive files to [.gitignore](mdc:.gitignore)
- ✅ **Always** use `git status` to review files before committing

### 2. Environment Variables Only

**Required Pattern**: All secrets must be stored as environment variables

```typescript
// ✅ CORRECT - Using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ❌ WRONG - Hard-coded secrets
const apiKey = "sk-1234567890abcdef";
```

### 3. Gitignore Requirements

Ensure [.gitignore](mdc:.gitignore) includes:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Configuration files
*.config.local
application.properties
.zshrc

# Generated files
*.log
coverage/
.nyc_output/
dist/
build/

# Database files
*.db
*.sqlite
database.json

# Backup files
*.backup
*.bak
```

## Project-Specific Security Standards

### Supabase Configuration

For [middleware.ts](mdc:middleware.ts) and auth configuration:

```typescript
// ✅ CORRECT - Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}
```

### Google Apps Script Security

For scripts in [scripts/google-apps-script/](mdc:scripts/google-apps-script):

- ✅ Store credentials using PropertiesService
- ✅ Use minimal OAuth scopes in [appsscript.json](mdc:scripts/google-apps-script/location-financials-sync/appsscript.json)
- ❌ Never hard-code clinic IDs or API endpoints

```javascript
// ✅ CORRECT - Using PropertiesService
const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');

// ❌ WRONG - Hard-coded values
const apiKey = 'your-api-key-here';
```

### API Route Security

For files in [src/app/api/](mdc:src/app/api):

```typescript
// ✅ CORRECT - Validate environment variables
export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server configuration error' }, 
      { status: 500 }
    );
  }
  
  // Use the key...
}
```

## Access Control Standards

### API Key Permissions

- ✅ **Default to minimal permissions** for all API keys
- ✅ **Use separate keys** for read-only vs read/write operations
- ✅ **Implement IP whitelisting** where appropriate
- ✅ **Use short-lived tokens** when possible

### Supabase RLS Policies

Ensure Row Level Security policies in [upload/supabase/migrations/](mdc:upload/supabase/migrations) follow:

```sql
-- ✅ CORRECT - Restrictive by default
CREATE POLICY "Users can only access their clinic data" ON location_financial
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid()
    )
  );
```

## Development Workflow

### Pre-Commit Checklist

Before any commit:

1. ✅ Run `git status` to review all files
2. ✅ Verify no `.env*` files are staged
3. ✅ Check for hard-coded secrets in code
4. ✅ Ensure all API calls use environment variables

### Code Review Requirements

- ✅ **Automated scanning**: Use GitGuardian or similar tools
- ✅ **Manual review**: Check for secrets in diffs
- ✅ **History review**: Verify secrets weren't added then removed

## Emergency Procedures

### If Secrets Are Committed

1. **Immediately revoke** the compromised secret
2. **Generate new credentials** 
3. **Update environment variables**
4. **Clean git history** if necessary:

```bash
# Remove file from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/file' \
  --prune-empty --tag-name-filter cat -- --all
```

### Secret Rotation Schedule

- 🔄 **API Keys**: Rotate every 90 days
- 🔄 **Database passwords**: Rotate every 180 days  
- 🔄 **Service tokens**: Rotate every 30 days
- 🔄 **OAuth secrets**: Rotate annually

## Monitoring and Alerts

### Required Monitoring

- 📊 **API usage patterns** - detect unusual activity
- 📊 **Failed authentication attempts**
- 📊 **Geographic access patterns**
- 📊 **Permission escalation attempts**

### Alert Thresholds

- 🚨 **Immediate**: Secrets detected in commits
- 🚨 **Immediate**: API calls from unauthorized IPs
- ⚠️ **Daily**: Unusual API usage patterns
- ⚠️ **Weekly**: Permission audit reports

## Tools and Resources

### Recommended Tools

- **GitGuardian**: Automated secrets scanning
- **SOPS**: Encrypted secrets in git
- **HashiCorp Vault**: Enterprise secrets management
- **AWS Secrets Manager**: Cloud-native secrets storage

### Documentation References

- [GitGuardian Best Practices](mdc:https:/blog.gitguardian.com/secrets-api-management)
- [OWASP Secrets Management](mdc:https:/owasp.org/www-community/vulnerabilities/Use_of_hard-coded_credentials)
- [Next.js Environment Variables](mdc:https:/nextjs.org/docs/basic-features/environment-variables)

## Compliance Requirements

### For Healthcare Data (HIPAA)

- ✅ **Encryption at rest** for all secrets
- ✅ **Audit logging** for all secret access
- ✅ **Access controls** based on least privilege
- ✅ **Regular rotation** of all credentials

### For Multi-Tenant Architecture

- ✅ **Clinic isolation** in all secret access
- ✅ **Separate credentials** per clinic where possible
- ✅ **RLS policies** enforcing tenant boundaries
- ✅ **Audit trails** per tenant

Remember: **Security is not optional**. Every developer must follow these practices without exception.

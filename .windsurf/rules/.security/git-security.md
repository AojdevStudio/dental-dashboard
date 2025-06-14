---
trigger: model_decision
description: 
globs: 
---
# Git Security Best Practices

## Overview

This rule defines Git workflow security standards to prevent secrets, credentials, and sensitive data from entering version control. Based on [GitGuardian's Git security guidelines](mdc:https:/blog.gitguardian.com/secrets-api-management).

## Critical Git Security Rules

### 1. Never Use Wildcard Git Commands

**Forbidden Commands**:
```bash
# ❌ NEVER use these commands
git add *
git add .
git add --all
```

**Required Workflow**:
```bash
# ✅ ALWAYS use explicit file additions
git status                    # Review all changes first
git add src/specific-file.ts  # Add files individually
git add src/components/       # Or add specific directories
git commit -m "descriptive message"
```

### 2. Pre-Commit Security Checklist

**Before every commit, verify**:

1. ✅ Run `git status` to review all staged files
2. ✅ Check that no `.env*` files are staged
3. ✅ Verify no configuration files with secrets are included
4. ✅ Scan diff for hard-coded credentials
5. ✅ Ensure all API keys use environment variables

### 3. Gitignore Security Requirements

The [.gitignore](mdc:.gitignore) file MUST include:

```gitignore
# Environment variables - CRITICAL
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local

# Supabase local config
.supabase/

# Google Apps Script credentials
scripts/google-apps-script/**/.clasp.json
scripts/google-apps-script/**/credentials.json

# Database files
*.db
*.sqlite
*.sqlite3
database.json
prisma/dev.db

# Configuration files that may contain secrets
config.local.js
config.local.ts
application.properties
.zshrc
.bashrc

# IDE and editor files that may store credentials
.vscode/settings.json
.idea/
*.swp
*.swo

# Log files that may contain sensitive data
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Backup files
*.backup
*.bak
*.tmp

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

## Project-Specific Git Security

### Dental Dashboard Sensitive Areas

**High-Risk Directories** (require extra scrutiny):

- [src/app/api/](mdc:src/app/api) - API routes with database connections
- [scripts/google-apps-script/](mdc:scripts/google-apps-script) - OAuth credentials
- [upload/supabase/](mdc:upload/supabase) - Database migrations and functions
- [prisma/](mdc:prisma) - Database schema and connection strings

### Google Apps Script Security

For [scripts/google-apps-script/location-financials-sync/](mdc:scripts/google-apps-script/location-financials-sync):

```bash
# ✅ SAFE to commit
git add scripts/google-apps-script/location-financials-sync/Code.gs
git add scripts/google-apps-script/location-financials-sync/appsscript.json

# ❌ NEVER commit these
# .clasp.json (contains script ID)
# credentials.json (OAuth credentials)
# Any files with API keys or tokens
```

### Supabase Configuration Security

For [upload/supabase/](mdc:upload/supabase) directory:

```bash
# ✅ SAFE to commit
git add upload/supabase/migrations/*.sql
git add upload/supabase/functions/*/index.ts

# ❌ NEVER commit these
# .env files in functions
# config.toml with actual URLs/keys
# Any files with service role keys
```

## Git History Security

### Checking for Secrets in History

```bash
# Search for potential secrets in git history
git log --all --full-history -- "*.env*"
git log --all --full-history -S "api_key" --source --all
git log --all --full-history -S "password" --source --all
git log --all --full-history -S "secret" --source --all
```

### If Secrets Are Found in History

**Immediate Actions**:

1. **Revoke the compromised secret** immediately
2. **Generate new credentials**
3. **Update all environments** with new secrets
4. **Clean git history** (if absolutely necessary):

```bash
# WARNING: This rewrites history - coordinate with team
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/secret-file' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dangerous - team coordination required)
git push origin --force --all
git push origin --force --tags
```

## Branch Protection and Security

### Required Branch Rules

For production branches, ensure:

- ✅ **Require pull requests** for all changes
- ✅ **Require status checks** (including secrets scanning)
- ✅ **Require up-to-date branches** before merging
- ✅ **Restrict force pushes** to prevent history rewriting
- ✅ **Require signed commits** for audit trails

### Pull Request Security Review

**Every PR must verify**:

1. ✅ No hard-coded secrets in the diff
2. ✅ All new API calls use environment variables
3. ✅ No sensitive files accidentally included
4. ✅ Proper error handling that doesn't expose secrets
5. ✅ Database queries don't log sensitive data

## Automated Security Scanning

### Required Git Hooks

**Pre-commit hook** (`.git/hooks/pre-commit`):

```bash
#!/bin/bash
# Check for common secret patterns
if git diff --cached --name-only | xargs grep -l "api_key\|password\|secret\|token" 2>/dev/null; then
    echo "❌ Potential secrets detected in staged files!"
    echo "Please review and use environment variables instead."
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -E "\.env" 2>/dev/null; then
    echo "❌ Environment files detected in staged changes!"
    echo "These should be in .gitignore, not committed."
    exit 1
fi
```

### Recommended Tools

- **GitGuardian**: Automated secrets detection
- **TruffleHog**: Git history secrets scanning  
- **detect-secrets**: Pre-commit secrets prevention
- **git-secrets**: AWS secrets prevention

## Emergency Response Procedures

### If Secrets Are Accidentally Committed

**Immediate Response (within 5 minutes)**:

1. 🚨 **Stop all deployments** using the compromised secrets
2. 🚨 **Revoke the secret** at the provider (Supabase, Google, etc.)
3. 🚨 **Generate new credentials** immediately
4. 🚨 **Update environment variables** in all environments
5. 🚨 **Notify team members** of the incident

**Follow-up Actions (within 1 hour)**:

1. 📋 **Document the incident** with timeline
2. 📋 **Review access logs** for unauthorized usage
3. 📋 **Clean git history** if necessary
4. 📋 **Update security procedures** to prevent recurrence

### Incident Documentation Template

```markdown
## Security Incident Report

**Date**: [YYYY-MM-DD HH:MM]
**Severity**: [High/Medium/Low]
**Type**: Secret exposed in git commit

### What Happened
- Commit hash: [hash]
- Secret type: [API key/password/token]
- Service affected: [Supabase/Google/etc.]

### Actions Taken
- [ ] Secret revoked at [time]
- [ ] New secret generated at [time]
- [ ] Environment variables updated at [time]
- [ ] Git history cleaned at [time]

### Prevention Measures
- [ ] Updated .gitignore
- [ ] Added pre-commit hooks
- [ ] Team training scheduled
```

## Team Training and Awareness

### Required Knowledge

Every developer must understand:

- 🎓 **Why private repos aren't safe** for secrets
- 🎓 **How git history works** and why secrets persist
- 🎓 **Proper environment variable usage**
- 🎓 **Emergency response procedures**

### Regular Security Reviews

**Monthly checklist**:

- 📅 Review .gitignore completeness
- 📅 Scan recent commits for potential secrets
- 📅 Verify all team members follow procedures
- 📅 Update security tools and configurations
- 📅 Test emergency response procedures

Remember: **Git never forgets**. Once a secret is committed, assume it's compromised forever.

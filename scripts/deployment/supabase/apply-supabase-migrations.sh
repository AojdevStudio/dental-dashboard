#!/bin/bash

# Supabase Migration Script
# Applies SQL migrations that Prisma can't handle

set -e

echo "🚀 Applying Supabase-specific migrations"
echo "========================================"
echo ""
echo "These migrations add:"
echo "- Row Level Security (RLS) policies"
echo "- Database triggers and functions"
echo "- Auth integration helpers"
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set"
    echo "Set it to your Supabase connection string from:"
    echo "Supabase Dashboard → Settings → Database → Connection string"
    exit 1
fi

echo "📋 Migrations to apply:"
echo "1. Row Level Security policies"
echo "2. Triggers and functions"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Apply RLS policies
echo "🔐 Applying Row Level Security..."
if psql "$DATABASE_URL" -f supabase/migrations/03_row_level_security.sql -v ON_ERROR_STOP=1; then
    echo "✅ RLS policies applied"
else
    echo "❌ RLS migration failed"
    exit 1
fi

# Apply triggers and functions
echo "⚡ Applying triggers and functions..."
if psql "$DATABASE_URL" -f supabase/migrations/04_triggers_and_functions.sql -v ON_ERROR_STOP=1; then
    echo "✅ Triggers applied"
else
    echo "❌ Triggers migration failed"
    echo "Rollback with: psql \$DATABASE_URL -f supabase/migrations/rollback/03_rollback_rls.sql"
    exit 1
fi

echo ""
echo "✅ All migrations applied successfully!"
echo ""
echo "Next steps:"
echo "1. Test your app functionality"
echo "2. Check Supabase Dashboard → Authentication → Users"
echo "3. Monitor logs for any errors"
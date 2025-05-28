#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = 'https://yovbdmjwrrgardkgrenc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = 'postgresql://postgres:4Fd5TiV9nrJxWt@db.yovbdmjwrrgardkgrenc.supabase.co:5432/postgres';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Get it from: Supabase Dashboard → Settings → API → Service Role Key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Migration files to apply
const MIGRATIONS = [
  {
    name: '03_row_level_security.sql',
    description: 'Row Level Security policies'
  },
  {
    name: '04_triggers_and_functions.sql', 
    description: 'Database triggers and functions'
  }
];

async function executeSqlFile(filepath: string): Promise<void> {
  const sql = await fs.readFile(filepath, 'utf8');
  
  // Split SQL into individual statements
  // This is a simple approach - may need refinement for complex SQL
  const statements = sql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^\s*--/));

  console.log(`📝 Found ${statements.length} SQL statements`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip empty statements
    if (!statement || statement.match(/^\s*$/)) {
      continue;
    }
    
    try {
      // Log progress for long migrations
      if (i % 10 === 0) {
        console.log(`   Processing statement ${i + 1}/${statements.length}...`);
      }
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
        console.error(`      Statement: ${statement.substring(0, 100)}...`);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ Error in statement ${i + 1}:`, err);
      errorCount++;
    }
  }
  
  console.log(`   ✅ Successfully executed: ${successCount} statements`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount} statements`);
    throw new Error(`${errorCount} statements failed`);
  }
}

async function main() {
  console.log('🚀 Applying Supabase Migrations');
  console.log('================================\n');
  
  for (const migration of MIGRATIONS) {
    const filepath = path.join(__dirname, '..', 'supabase', 'migrations', migration.name);
    
    console.log(`\n📋 Applying: ${migration.description}`);
    console.log(`   File: ${migration.name}`);
    
    try {
      await executeSqlFile(filepath);
      console.log(`✅ ${migration.description} - Applied successfully!\n`);
    } catch (error) {
      console.error(`❌ ${migration.description} - Failed!`);
      console.error(error);
      
      // Show rollback instructions
      if (migration.name === '03_row_level_security.sql') {
        console.log('\n🔄 To rollback RLS:');
        console.log('   Run: supabase/migrations/rollback/03_rollback_rls.sql');
      }
      
      process.exit(1);
    }
  }
  
  console.log('\n✅ All migrations applied successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Test authentication and RLS policies');
  console.log('2. Verify triggers are working');
  console.log('3. Check audit logs after making changes');
}

// Create an RPC function to execute raw SQL (if it doesn't exist)
async function setupExecSqlFunction() {
  const setupSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
  `;
  
  // This might fail if function already exists, which is fine
  await supabase.rpc('query', { query: setupSql }).catch(() => {});
}

// Run migrations
setupExecSqlFunction()
  .then(() => main())
  .catch(console.error);
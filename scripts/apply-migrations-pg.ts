#!/usr/bin/env tsx

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

const { Client } = pg;

// Database configuration - Using pooler connection
const DATABASE_URL = 'postgresql://postgres.yovbdmjwrrgardkgrenc:4Fd5TiV9nrJxWt@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

// Migration files to apply
const MIGRATIONS = [
  {
    name: '03_row_level_security.sql',
    description: 'Row Level Security policies'
  },
  {
    name: '04_triggers_and_functions.sql', 
    description: 'Database triggers and functions'
  },
  {
    name: '04_scheduled_jobs_setup.sql',
    description: 'Scheduled jobs setup (optional)'
  }
];

async function executeSqlFile(client: pg.Client, filepath: string): Promise<void> {
  const sql = await fs.readFile(filepath, 'utf8');
  
  console.log(`📝 Executing SQL from ${path.basename(filepath)}`);
  
  try {
    // Execute the entire SQL file as one transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`✅ Successfully executed ${path.basename(filepath)}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function checkMigrationStatus(client: pg.Client) {
  console.log('\n📊 Checking current migration status...');
  
  // Check if RLS is enabled
  const rlsResult = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'clinics', 'providers')
    ORDER BY tablename
  `);
  
  console.log('\nRLS Status:');
  rlsResult.rows.forEach(row => {
    console.log(`  ${row.tablename}: ${row.rowsecurity ? '✅ Enabled' : '❌ Disabled'}`);
  });
  
  // Check for RLS functions
  const functionsResult = await client.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'auth' 
    AND routine_name IN ('get_user_clinics', 'has_clinic_access', 'is_clinic_admin', 'get_user_role')
    ORDER BY routine_name
  `);
  
  console.log('\nRLS Functions:');
  if (functionsResult.rows.length === 0) {
    console.log('  ❌ No RLS functions found');
  } else {
    functionsResult.rows.forEach(row => {
      console.log(`  ✅ ${row.routine_name}`);
    });
  }
  
  // Check for triggers
  const triggersResult = await client.query(`
    SELECT trigger_name, event_object_table 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name
  `);
  
  console.log('\nTriggers:');
  if (triggersResult.rows.length === 0) {
    console.log('  ❌ No triggers found');
  } else {
    triggersResult.rows.forEach(row => {
      console.log(`  ✅ ${row.event_object_table}: ${row.trigger_name}`);
    });
  }
}

async function main() {
  console.log('🚀 Applying Supabase Migrations via Direct PostgreSQL Connection');
  console.log('==============================================================\n');
  
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check current status
    await checkMigrationStatus(client);
    
    console.log('\n📋 Migrations to apply:');
    MIGRATIONS.forEach((m, i) => {
      console.log(`${i + 1}. ${m.description} (${m.name})`);
    });
    
    // Apply migrations
    for (const migration of MIGRATIONS) {
      const filepath = path.join(__dirname, '..', 'supabase', 'migrations', migration.name);
      
      // Check if file exists
      try {
        await fs.access(filepath);
      } catch {
        console.log(`\n⚠️  Skipping ${migration.name} - file not found`);
        continue;
      }
      
      console.log(`\n📋 Applying: ${migration.description}`);
      
      try {
        await executeSqlFile(client, filepath);
      } catch (error: any) {
        console.error(`\n❌ Migration failed: ${migration.name}`);
        console.error(`Error: ${error.message}`);
        
        // Show specific error details
        if (error.detail) {
          console.error(`Detail: ${error.detail}`);
        }
        if (error.hint) {
          console.error(`Hint: ${error.hint}`);
        }
        
        // Rollback instructions
        if (migration.name === '03_row_level_security.sql') {
          console.log('\n🔄 To rollback RLS:');
          console.log('   Run: supabase/migrations/rollback/03_rollback_rls.sql');
        }
        
        throw error;
      }
    }
    
    console.log('\n✅ All migrations applied successfully!');
    
    // Final status check
    console.log('\n📊 Final migration status:');
    await checkMigrationStatus(client);
    
    console.log('\n📝 Next steps:');
    console.log('1. Test authentication with a real user');
    console.log('2. Verify RLS policies are working correctly');
    console.log('3. Check that triggers fire on user creation/update');
    console.log('4. Monitor audit logs for changes');
    
  } catch (error) {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run the migration
main().catch(console.error);
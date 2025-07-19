#!/usr/bin/env tsx

import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

// Database configuration - Using pooler connection
const DATABASE_URL =
  'postgresql://postgres.yovbdmjwrrgardkgrenc:4Fd5TiV9nrJxWt@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

// Migration files to apply
const MIGRATIONS = [
  {
    name: '03_row_level_security.sql',
    description: 'Row Level Security policies',
  },
  {
    name: '04_triggers_and_functions.sql',
    description: 'Database triggers and functions',
  },
  {
    name: '04_scheduled_jobs_setup.sql',
    description: 'Scheduled jobs setup (optional)',
  },
];

async function executeSqlFile(client: pg.Client, filepath: string): Promise<void> {
  const sql = await fs.readFile(filepath, 'utf8');

  try {
    // Execute the entire SQL file as one transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function checkMigrationStatus(client: pg.Client) {
  // Check if RLS is enabled
  const _rlsResult = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'clinics', 'providers')
    ORDER BY tablename
  `);
  // RLS status results logged above

  // Check for RLS functions
  const functionsResult = await client.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'auth' 
    AND routine_name IN ('get_user_clinics', 'has_clinic_access', 'is_clinic_admin', 'get_user_role')
    ORDER BY routine_name
  `);
  if (functionsResult.rows.length === 0) {
  } else {
    // Functions found and logged above
  }

  // Check for triggers
  const triggersResult = await client.query(`
    SELECT trigger_name, event_object_table 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name
  `);
  if (triggersResult.rows.length === 0) {
  } else {
    // Triggers found and logged above
  }
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();

    // Check current status
    await checkMigrationStatus(client);
    MIGRATIONS.forEach((_m, _i) => {});

    // Apply migrations
    for (const migration of MIGRATIONS) {
      const filepath = path.join(__dirname, '..', 'supabase', 'migrations', migration.name);

      // Check if file exists
      try {
        await fs.access(filepath);
      } catch {
        continue;
      }

      try {
        await executeSqlFile(client, filepath);
      } catch (error: unknown) {
        // Show specific error details
        const pgError = error as { detail?: string; hint?: string };
        if (pgError.detail) {
        }
        if (pgError.hint) {
        }

        // Rollback instructions
        if (migration.name === '03_row_level_security.sql') {
        }

        throw error;
      }
    }
    await checkMigrationStatus(client);
  } catch (_error) {
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
main().catch(console.error);

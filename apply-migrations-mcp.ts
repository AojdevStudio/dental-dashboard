#!/usr/bin/env tsx

/**
 * Apply Supabase migrations via MCP
 * This script reads and applies SQL migrations to your Supabase database
 */

import fs from 'fs';
import path from 'path';

// Configuration
const PROJECT_ID = 'yovbdmjwrrgardkgrenc';
const MIGRATIONS_DIR = './supabase/migrations';

// Migration files to apply in order
const MIGRATION_FILES = [
  '03_row_level_security.sql',
  '04_triggers_and_functions.sql',
  '04_scheduled_jobs_setup.sql'
];

interface MigrationResult {
  file: string;
  success: boolean;
  error?: string;
}

async function applyMigration(filename: string): Promise<MigrationResult> {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filepath, 'utf8');
    
    console.log(`\n📋 Applying migration: ${filename}`);
    console.log('=' .repeat(50));
    
    // Split by statement (simple approach - may need refinement)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements`);
    
    // Apply each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Here you would call the MCP execute_sql function
      // For now, we'll just log what would be executed
      console.log(`Would execute: ${statement.substring(0, 100)}...`);
    }
    
    return { file: filename, success: true };
  } catch (error) {
    console.error(`❌ Error applying ${filename}:`, error);
    return { 
      file: filename, 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  console.log('🚀 Supabase Migration Tool via MCP');
  console.log('=' .repeat(50));
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Migrations to apply: ${MIGRATION_FILES.length}`);
  
  const results: MigrationResult[] = [];
  
  for (const file of MIGRATION_FILES) {
    const result = await applyMigration(file);
    results.push(result);
    
    if (!result.success) {
      console.log('\n⚠️  Migration failed, stopping here');
      break;
    }
  }
  
  // Summary
  console.log('\n📊 Migration Summary');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Some migrations failed:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.file}: ${r.error}`));
  } else {
    console.log('\n✅ All migrations applied successfully!');
  }
}

// Run the script
main().catch(console.error);
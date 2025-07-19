#!/usr/bin/env tsx

/**
 * Provider Schema Validation Script
 * 
 * This script validates the provider-clinic relationship schema after applying
 * the RLS security fixes and enhancements. It performs comprehensive checks
 * on database structure, security policies, indexes, and data integrity.
 * 
 * Usage: pnpm dlx tsx scripts/validate-provider-schema.ts
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Initialize clients
const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: unknown;
}

const results: ValidationResult[] = [];

function addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: unknown) {
  results.push({ category, test, status, message, details });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} [${category}] ${test}: ${message}`);
  if (details) {
    console.log('   Details:', details);
  }
}

async function validateTableStructure() {
  console.log('\n🔍 Validating Table Structure...');
  
  try {
    // Check required tables exist
    const { data: tables, error } = await supabase.rpc('get_table_info', {
      schema_name: 'public'
    }).then(() => ({ data: null, error: 'Function not found - using direct query' }));
    
    // Direct query since RPC might not exist
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('providers', 'clinics', 'locations', 'provider_locations')
      ORDER BY table_name
    `;
    
    const { data: tableData, error: tableError } = await supabase.rpc('sql', { query: tableQuery });
    
    if (tableError) {
      // Direct query using raw SQL
      const directQuery = await prisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('providers', 'clinics', 'locations', 'provider_locations')
        ORDER BY table_name
      `) as Array<{ table_name: string }>;
      
      const expectedTables = ['clinics', 'locations', 'provider_locations', 'providers'];
      const foundTables = directQuery.map(row => row.table_name);
      
      for (const table of expectedTables) {
        if (foundTables.includes(table)) {
          addResult('Structure', `Table ${table}`, 'PASS', 'Table exists');
        } else {
          addResult('Structure', `Table ${table}`, 'FAIL', 'Table missing');
        }
      }
    }
    
    // Validate provider_locations junction table structure
    const plColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'provider_locations'
      ORDER BY ordinal_position
    `) as Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>;
    
    const requiredColumns = {
      'id': 'text',
      'provider_id': 'text', 
      'location_id': 'text',
      'is_active': 'boolean',
      'start_date': 'timestamp without time zone',
      'end_date': 'timestamp without time zone',
      'is_primary': 'boolean'
    };
    
    for (const [colName, expectedType] of Object.entries(requiredColumns)) {
      const column = plColumns.find(col => col.column_name === colName);
      if (column) {
        if (column.data_type === expectedType || 
            (expectedType === 'timestamp without time zone' && column.data_type.includes('timestamp'))) {
          addResult('Structure', `Column ${colName}`, 'PASS', `Correct type: ${column.data_type}`);
        } else {
          addResult('Structure', `Column ${colName}`, 'FAIL', 
            `Type mismatch - expected: ${expectedType}, found: ${column.data_type}`);
        }
      } else {
        addResult('Structure', `Column ${colName}`, 'FAIL', 'Column missing');
      }
    }
    
  } catch (error) {
    addResult('Structure', 'Table Validation', 'FAIL', 'Error validating table structure', error);
  }
}

async function validateConstraints() {
  console.log('\n🔗 Validating Foreign Key Constraints...');
  
  try {
    const constraints = await prisma.$queryRawUnsafe(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('providers', 'locations', 'provider_locations')
        AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, tc.constraint_name
    `) as Array<{
      constraint_name: string;
      table_name: string;
      constraint_type: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }>;
    
    const expectedConstraints = [
      { table: 'providers', column: 'clinic_id', foreign_table: 'clinics' },
      { table: 'locations', column: 'clinic_id', foreign_table: 'clinics' },
      { table: 'provider_locations', column: 'provider_id', foreign_table: 'providers' },
      { table: 'provider_locations', column: 'location_id', foreign_table: 'locations' }
    ];
    
    for (const expected of expectedConstraints) {
      const found = constraints.find(c => 
        c.table_name === expected.table && 
        c.column_name === expected.column &&
        c.foreign_table_name === expected.foreign_table
      );
      
      if (found) {
        addResult('Constraints', `FK ${expected.table}.${expected.column}`, 'PASS', 
          `References ${expected.foreign_table}`);
      } else {
        addResult('Constraints', `FK ${expected.table}.${expected.column}`, 'FAIL', 
          `Missing foreign key to ${expected.foreign_table}`);
      }
    }
    
  } catch (error) {
    addResult('Constraints', 'Foreign Key Validation', 'FAIL', 'Error validating constraints', error);
  }
}

async function validateRLSPolicies() {
  console.log('\n🛡️ Validating RLS Policies...');
  
  try {
    // Check if RLS is enabled
    const rlsStatus = await prisma.$queryRawUnsafe(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('providers', 'clinics', 'locations', 'provider_locations')
      ORDER BY tablename
    `) as Array<{ tablename: string; rowsecurity: boolean }>;
    
    for (const table of rlsStatus) {
      if (table.rowsecurity) {
        addResult('Security', `RLS on ${table.tablename}`, 'PASS', 'RLS enabled');
      } else {
        addResult('Security', `RLS on ${table.tablename}`, 'FAIL', 'RLS not enabled');
      }
    }
    
    // Check if policies exist
    const policies = await prisma.$queryRawUnsafe(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('providers', 'clinics', 'locations', 'provider_locations')
      ORDER BY tablename, policyname
    `) as Array<{
      schemaname: string;
      tablename: string;
      policyname: string;
      permissive: string;
      roles: string[];
      cmd: string;
    }>;
    
    const expectedPolicies = [
      'clinics_clinic_isolation',
      'providers_clinic_isolation', 
      'locations_clinic_isolation',
      'provider_locations_clinic_isolation'
    ];
    
    for (const expectedPolicy of expectedPolicies) {
      const found = policies.find(p => p.policyname === expectedPolicy);
      if (found) {
        addResult('Security', `Policy ${expectedPolicy}`, 'PASS', 
          `Policy exists for ${found.tablename}`);
      } else {
        addResult('Security', `Policy ${expectedPolicy}`, 'FAIL', 'Policy missing');
      }
    }
    
  } catch (error) {
    addResult('Security', 'RLS Policy Validation', 'FAIL', 'Error validating RLS policies', error);
  }
}

async function validateIndexes() {
  console.log('\n📊 Validating Performance Indexes...');
  
  try {
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('providers', 'clinics', 'locations', 'provider_locations')
      ORDER BY tablename, indexname
    `) as Array<{
      schemaname: string;
      tablename: string;
      indexname: string;
      indexdef: string;
    }>;
    
    const criticalIndexes = [
      { table: 'providers', name: 'providers_clinic_id_idx', description: 'RLS performance index' },
      { table: 'locations', name: 'locations_clinic_id_idx', description: 'Clinic relationship index' },
      { table: 'provider_locations', name: 'provider_locations_provider_id_idx', description: 'Provider relationship index' },
      { table: 'provider_locations', name: 'provider_locations_location_id_idx', description: 'Location relationship index' }
    ];
    
    for (const criticalIndex of criticalIndexes) {
      const found = indexes.find(idx => 
        idx.tablename === criticalIndex.table && idx.indexname === criticalIndex.name
      );
      
      if (found) {
        addResult('Performance', `Index ${criticalIndex.name}`, 'PASS', criticalIndex.description);
      } else {
        addResult('Performance', `Index ${criticalIndex.name}`, 'WARNING', 
          `Missing ${criticalIndex.description} - may impact performance`);
      }
    }
    
    // Check for unique constraints
    const uniqueIndexes = indexes.filter(idx => idx.indexdef.includes('UNIQUE'));
    const expectedUnique = [
      'providers_email_key',
      'locations_clinic_id_name_key',
      'provider_locations_provider_id_location_id_key'
    ];
    
    for (const expectedIdx of expectedUnique) {
      const found = uniqueIndexes.find(idx => idx.indexname === expectedIdx);
      if (found) {
        addResult('Performance', `Unique ${expectedIdx}`, 'PASS', 'Unique constraint exists');
      } else {
        addResult('Performance', `Unique ${expectedIdx}`, 'FAIL', 'Missing unique constraint');
      }
    }
    
  } catch (error) {
    addResult('Performance', 'Index Validation', 'FAIL', 'Error validating indexes', error);
  }
}

async function validateDataIntegrity() {
  console.log('\n🔍 Validating Data Integrity...');
  
  try {
    // Check for orphaned records
    const orphanedProviders = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM providers p
      LEFT JOIN clinics c ON p.clinic_id = c.id
      WHERE c.id IS NULL
    `) as Array<{ count: BigInt }>;
    
    const orphanCount = Number(orphanedProviders[0].count);
    if (orphanCount === 0) {
      addResult('Integrity', 'Orphaned Providers', 'PASS', 'No orphaned provider records');
    } else {
      addResult('Integrity', 'Orphaned Providers', 'FAIL', 
        `Found ${orphanCount} providers without valid clinic references`);
    }
    
    // Check provider-location relationships
    const invalidProviderLocations = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM provider_locations pl
      LEFT JOIN providers p ON pl.provider_id = p.id
      LEFT JOIN locations l ON pl.location_id = l.id
      WHERE p.id IS NULL OR l.id IS NULL
    `) as Array<{ count: BigInt }>;
    
    const invalidCount = Number(invalidProviderLocations[0].count);
    if (invalidCount === 0) {
      addResult('Integrity', 'Provider-Location Links', 'PASS', 'All relationships valid');
    } else {
      addResult('Integrity', 'Provider-Location Links', 'FAIL', 
        `Found ${invalidCount} invalid provider-location relationships`);
    }
    
    // Check for providers with multiple primary locations
    const multiPrimary = await prisma.$queryRawUnsafe(`
      SELECT provider_id, COUNT(*) as primary_count
      FROM provider_locations
      WHERE is_primary = true AND is_active = true
      GROUP BY provider_id
      HAVING COUNT(*) > 1
    `) as Array<{ provider_id: string; primary_count: BigInt }>;
    
    if (multiPrimary.length === 0) {
      addResult('Integrity', 'Primary Location Uniqueness', 'PASS', 
        'Each provider has at most one primary location');
    } else {
      addResult('Integrity', 'Primary Location Uniqueness', 'WARNING', 
        `Found ${multiPrimary.length} providers with multiple primary locations`, 
        multiPrimary.map(mp => ({ provider_id: mp.provider_id, count: Number(mp.primary_count) })));
    }
    
  } catch (error) {
    addResult('Integrity', 'Data Integrity Check', 'FAIL', 'Error validating data integrity', error);
  }
}

async function validateAPIIntegration() {
  console.log('\n🔌 Validating API Integration...');
  
  try {
    // Test basic provider query
    const providers = await prisma.provider.findMany({
      take: 1,
      include: {
        clinic: { select: { id: true, name: true } },
        providerLocations: {
          include: {
            location: { select: { id: true, name: true } }
          }
        }
      }
    });
    
    if (providers.length >= 0) {
      addResult('API', 'Provider Query', 'PASS', 'Basic provider query works');
      
      if (providers.length > 0) {
        const provider = providers[0];
        
        // Validate provider structure
        if (provider.clinic) {
          addResult('API', 'Provider-Clinic Relationship', 'PASS', 'Clinic relationship loaded');
        } else {
          addResult('API', 'Provider-Clinic Relationship', 'FAIL', 'Clinic relationship not loaded');
        }
        
        if (provider.providerLocations) {
          addResult('API', 'Provider-Location Relationship', 'PASS', 
            `Loaded ${provider.providerLocations.length} location relationships`);
        } else {
          addResult('API', 'Provider-Location Relationship', 'WARNING', 
            'Provider locations not loaded');
        }
      }
    }
    
    // Test clinic query
    const clinics = await prisma.clinic.count();
    if (clinics >= 0) {
      addResult('API', 'Clinic Query', 'PASS', `Found ${clinics} clinics`);
    }
    
    // Test location query
    const locations = await prisma.location.count();
    if (locations >= 0) {
      addResult('API', 'Location Query', 'PASS', `Found ${locations} locations`);
    }
    
  } catch (error) {
    addResult('API', 'API Integration Test', 'FAIL', 'Error testing API integration', error);
  }
}

async function generateReport() {
  console.log('\n📋 Generating Validation Report...');
  
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'PASS').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    warnings: results.filter(r => r.status === 'WARNING').length
  };
  
  const categories = [...new Set(results.map(r => r.category))];
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 PROVIDER SCHEMA VALIDATION SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n📈 Overall Results:`);
  console.log(`   Total Tests: ${summary.total}`);
  console.log(`   ✅ Passed: ${summary.passed}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   ⚠️  Warnings: ${summary.warnings}`);
  
  const successRate = Math.round((summary.passed / summary.total) * 100);
  console.log(`   📊 Success Rate: ${successRate}%`);
  
  console.log(`\n📋 Results by Category:`);
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
    const categoryFailed = categoryResults.filter(r => r.status === 'FAIL').length;
    const categoryWarnings = categoryResults.filter(r => r.status === 'WARNING').length;
    
    console.log(`\n   ${category}:`);
    console.log(`     ✅ Passed: ${categoryPassed}`);
    console.log(`     ❌ Failed: ${categoryFailed}`);
    console.log(`     ⚠️  Warnings: ${categoryWarnings}`);
  }
  
  // Show failed tests
  const failedTests = results.filter(r => r.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    for (const test of failedTests) {
      console.log(`   • [${test.category}] ${test.test}: ${test.message}`);
    }
  }
  
  // Show warnings
  const warningTests = results.filter(r => r.status === 'WARNING');
  if (warningTests.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    for (const test of warningTests) {
      console.log(`   • [${test.category}] ${test.test}: ${test.message}`);
    }
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  
  if (summary.failed > 0) {
    console.log(`   1. Address ${summary.failed} failed tests before deployment`);
    console.log(`   2. Run migrations 005_fix_provider_rls_policies.sql if RLS failures`);
    console.log(`   3. Check database connectivity and permissions`);
  } else if (summary.warnings > 0) {
    console.log(`   1. Review ${summary.warnings} warnings for performance optimizations`);
    console.log(`   2. Consider running migration 006_provider_schema_enhancements.sql`);
  } else {
    console.log(`   1. ✅ Schema validation passed! Ready for production deployment`);
    console.log(`   2. Consider implementing enhanced features from migration 006`);
    console.log(`   3. Set up monitoring for RLS policy performance`);
  }
  
  console.log(`\n🎯 Overall Status: ${summary.failed === 0 ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
  console.log('='.repeat(80));
  
  return {
    success: summary.failed === 0,
    summary,
    results,
    recommendations: failedTests.length > 0 ? 'Fix failed tests' : 'Schema ready for production'
  };
}

async function main() {
  console.log('🚀 Starting Provider Schema Validation...');
  console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
  
  try {
    await validateTableStructure();
    await validateConstraints();
    await validateRLSPolicies();
    await validateIndexes();
    await validateDataIntegrity();
    await validateAPIIntegration();
    
    const report = await generateReport();
    
    // Exit with error code if validation failed
    process.exit(report.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as validateProviderSchema };
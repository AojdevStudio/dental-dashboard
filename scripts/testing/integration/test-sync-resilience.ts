#!/usr/bin/env tsx

/**
 * SYNC RESILIENCE INTEGRATION TEST
 * 
 * Tests the complete sync resilience system with controlled database reseed
 * Validates that external systems continue working after database ID changes
 * 
 * Usage:
 *   pnpm dlx tsx scripts/test-sync-resilience.ts
 *   node scripts/test-sync-resilience.js
 * 
 * @version 1.0.0
 * @requires prisma, @prisma/client
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/lib/utils/logger';
import { performPostReseedSync } from './post-reseed-sync';

const logger = createLogger({ context: 'SyncResilienceTest' });
const prisma = new PrismaClient();

interface TestReport {
  testName: string;
  phases: TestPhase[];
  overallSuccess: boolean;
  totalDuration: number;
  summary: string;
}

interface TestPhase {
  name: string;
  success: boolean;
  duration: number;
  details: string;
  errors: string[];
  data?: Record<string, unknown>;
}

/**
 * Main integration test function
 */
async function runSyncResilienceTest(): Promise<TestReport> {
  const startTime = Date.now();
  const report: TestReport = {
    testName: 'Sync Resilience Integration Test',
    phases: [],
    overallSuccess: false,
    totalDuration: 0,
    summary: ''
  };

  try {
    logger.info('🧪 Starting Sync Resilience Integration Test...');
    
    // Phase 1: Pre-test validation
    report.phases.push(await runTestPhase('Phase 1: Pre-test Validation', validatePreTestState));
    
    // Phase 2: Capture baseline state
    report.phases.push(await runTestPhase('Phase 2: Capture Baseline State', captureBaselineState));
    
    // Phase 3: Simulate database reseed
    report.phases.push(await runTestPhase('Phase 3: Simulate Database Reseed', simulateReseed));
    
    // Phase 4: Test post-reseed sync
    report.phases.push(await runTestPhase('Phase 4: Post-Reseed Synchronization', testPostReseedSync));
    
    // Phase 5: Validate sync resilience
    report.phases.push(await runTestPhase('Phase 5: Validate Sync Resilience', validateSyncResilience));
    
    // Phase 6: Test external ID resolution
    report.phases.push(await runTestPhase('Phase 6: Test External ID Resolution', testExternalIdResolution));
    
    // Phase 7: Cleanup and restore
    report.phases.push(await runTestPhase('Phase 7: Cleanup and Restore', cleanupAndRestore));
    
    // Calculate overall results
    const successfulPhases = report.phases.filter(p => p.success).length;
    report.overallSuccess = successfulPhases === report.phases.length;
    report.totalDuration = Math.round((Date.now() - startTime) / 1000);
    report.summary = generateTestSummary(report);
    
    logger.info('🏁 Sync Resilience Integration Test completed', {
      success: report.overallSuccess,
      duration: report.totalDuration,
      successfulPhases,
      totalPhases: report.phases.length
    });

    return report;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    report.phases.push({
      name: 'Critical Test Failure',
      success: false,
      duration: Math.round((Date.now() - startTime) / 1000),
      details: `Test failed with critical error: ${errorMessage}`,
      errors: [errorMessage]
    });
    
    report.overallSuccess = false;
    report.totalDuration = Math.round((Date.now() - startTime) / 1000);
    report.summary = `CRITICAL FAILURE: ${errorMessage}`;
    
    logger.error('💥 Critical test failure', { error: errorMessage });
    return report;
  }
}

/**
 * Run a single test phase with timing and error handling
 */
async function runTestPhase(
  phaseName: string, 
  phaseFunction: () => Promise<TestPhase>
): Promise<TestPhase> {
  const phaseStart = Date.now();
  
  try {
    logger.info(`📋 Starting ${phaseName}...`);
    
    const result = await phaseFunction();
    result.duration = Math.round((Date.now() - phaseStart) / 1000);
    
    if (result.success) {
      logger.info(`✅ ${phaseName} completed successfully`, { duration: result.duration });
    } else {
      logger.warn(`⚠️ ${phaseName} completed with issues`, { 
        duration: result.duration, 
        errors: result.errors 
      });
    }
    
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ ${phaseName} failed`, { error: errorMessage });
    
    return {
      name: phaseName,
      success: false,
      duration: Math.round((Date.now() - phaseStart) / 1000),
      details: `Phase failed with error: ${errorMessage}`,
      errors: [errorMessage]
    };
  }
}

/**
 * Phase 1: Validate pre-test state
 */
async function validatePreTestState(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Pre-test Validation',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Validate required tables exist
    const clinics = await prisma.clinic.count();
    const providers = await prisma.provider.count();
    const locations = await prisma.location.count();
    const mappings = await prisma.externalIdMapping.count();
    
    // Check for stable codes
    const clinicsWithCodes = await prisma.clinic.count({
      where: { clinicCode: { not: null } }
    });
    
    const providersWithCodes = await prisma.provider.count({
      where: { providerCode: { not: null } }
    });
    
    // Validate PostgreSQL functions exist
    const functions = await prisma.$queryRaw<Array<{ function_name: string }>>`
      SELECT routine_name as function_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('get_clinic_id_by_code', 'get_provider_id_by_code', 'get_entity_id_by_external_mapping')
    `;
    
    const validationResults = {
      database_connected: true,
      clinics_count: clinics,
      providers_count: providers,
      locations_count: locations,
      mappings_count: mappings,
      clinics_with_codes: clinicsWithCodes,
      providers_with_codes: providersWithCodes,
      postgresql_functions: functions.length
    };
    
    // Determine success
    const hasRequiredData = clinics > 0 && providers > 0 && mappings > 0;
    const hasStableCodes = clinicsWithCodes > 0 && providersWithCodes > 0;
    const hasFunctions = functions.length === 3;
    
    phase.success = hasRequiredData && hasStableCodes && hasFunctions;
    phase.data = validationResults;
    
    if (phase.success) {
      phase.details = `Pre-test validation successful: ${clinics} clinics, ${providers} providers, ${mappings} mappings, ${functions.length} PostgreSQL functions`;
    } else {
      if (!hasRequiredData) phase.errors.push('Insufficient data in database');
      if (!hasStableCodes) phase.errors.push('Missing stable codes');
      if (!hasFunctions) phase.errors.push(`Missing PostgreSQL functions (found ${functions.length}/3)`);
      
      phase.details = `Pre-test validation failed: ${phase.errors.join(', ')}`;
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `Pre-test validation error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Phase 2: Capture baseline state
 */
async function captureBaselineState(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Capture Baseline State',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // Capture current IDs and codes
    const clinics = await prisma.clinic.findMany({
      where: { clinicCode: { not: null } },
      select: { id: true, clinicCode: true, name: true }
    });
    
    const providers = await prisma.provider.findMany({
      where: { providerCode: { not: null } },
      select: { id: true, providerCode: true, firstName: true, lastName: true }
    });
    
    const locations = await prisma.location.findMany({
      where: { locationCode: { not: null } },
      select: { id: true, locationCode: true, name: true }
    });
    
    const mappings = await prisma.externalIdMapping.findMany({
      select: { 
        id: true, 
        systemName: true, 
        externalId: true, 
        entityType: true, 
        internalId: true 
      }
    });
    
    const baselineData = {
      clinics: clinics.map(c => ({ id: c.id, code: c.clinicCode, name: c.name })),
      providers: providers.map(p => ({ id: p.id, code: p.providerCode, name: `${p.firstName} ${p.lastName}` })),
      locations: locations.map(l => ({ id: l.id, code: l.locationCode, name: l.name })),
      mappings: mappings.map(m => ({ 
        id: m.id, 
        system: m.systemName, 
        external: m.externalId, 
        type: m.entityType, 
        internal: m.internalId 
      })),
      timestamp: new Date().toISOString()
    };
    
    phase.data = baselineData;
    phase.success = clinics.length > 0 && providers.length > 0 && mappings.length > 0;
    
    if (phase.success) {
      phase.details = `Baseline captured: ${clinics.length} clinics, ${providers.length} providers, ${locations.length} locations, ${mappings.length} mappings`;
    } else {
      phase.errors.push('Insufficient baseline data');
      phase.details = 'Failed to capture adequate baseline state';
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `Baseline capture error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Phase 3: Simulate database reseed (changes IDs but preserves codes)
 */
async function simulateReseed(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Simulate Database Reseed',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // NOTE: This is a simulation - we'll update external mappings to point to fake IDs
    // In a real reseed, the entity IDs would change but codes would remain the same
    
    const fakeIdOffset = 999999; // Large offset to simulate new IDs
    
    // Get current mappings to simulate their invalidation
    const currentMappings = await prisma.externalIdMapping.findMany();
    
    // Update mappings to point to fake IDs (simulating broken state after reseed)
    const updatePromises = currentMappings.map(mapping => 
      prisma.externalIdMapping.update({
        where: { id: mapping.id },
        data: { internalId: `fake_${fakeIdOffset}_${mapping.internalId}` }
      })
    );
    
    await Promise.all(updatePromises);
    
    // Verify mappings now point to invalid IDs
    const invalidMappings = await prisma.externalIdMapping.count({
      where: { internalId: { startsWith: 'fake_' } }
    });
    
    phase.success = invalidMappings === currentMappings.length;
    phase.data = {
      mappings_invalidated: invalidMappings,
      original_mappings: currentMappings.length,
      simulation_successful: phase.success
    };
    
    if (phase.success) {
      phase.details = `Reseed simulation successful: ${invalidMappings} mappings invalidated`;
    } else {
      phase.errors.push('Failed to properly simulate reseed state');
      phase.details = `Reseed simulation failed: ${invalidMappings}/${currentMappings.length} mappings invalidated`;
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `Reseed simulation error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Phase 4: Test post-reseed synchronization
 */
async function testPostReseedSync(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Post-Reseed Synchronization',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // Run the post-reseed sync function
    const syncResult = await performPostReseedSync();
    
    phase.success = syncResult.success;
    phase.data = {
      sync_success: syncResult.success,
      clinics_processed: syncResult.clinicsProcessed,
      providers_processed: syncResult.providersProcessed,
      locations_processed: syncResult.locationsProcessed,
      mappings_updated: syncResult.mappingsUpdated,
      sync_errors: syncResult.errors
    };
    
    if (phase.success) {
      phase.details = syncResult.summary;
    } else {
      phase.errors.push(...syncResult.errors);
      phase.details = `Post-reseed sync failed: ${syncResult.errors.join(', ')}`;
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `Post-reseed sync error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Phase 5: Validate sync resilience
 */
async function validateSyncResilience(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Validate Sync Resilience',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // Verify all mappings now point to valid IDs
    const validMappings = await prisma.externalIdMapping.count({
      where: { 
        NOT: { internalId: { startsWith: 'fake_' } }
      }
    });
    
    const totalMappings = await prisma.externalIdMapping.count();
    const invalidMappings = totalMappings - validMappings;
    
    // Test specific mapping resolutions
    const testResolutions = [];
    
    // Test clinic resolution
    try {
      const humbleClinic = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT get_clinic_id_by_code('KAMDENTAL_HUMBLE') as id
      `;
      testResolutions.push({ type: 'clinic', code: 'KAMDENTAL_HUMBLE', resolved: humbleClinic.length > 0 });
    } catch (error) {
      testResolutions.push({ type: 'clinic', code: 'KAMDENTAL_HUMBLE', resolved: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    // Test provider resolution
    try {
      const obinnaProvider = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT get_provider_id_by_code('obinna_ezeji') as id
      `;
      testResolutions.push({ type: 'provider', code: 'obinna_ezeji', resolved: obinnaProvider.length > 0 });
    } catch (error) {
      testResolutions.push({ type: 'provider', code: 'obinna_ezeji', resolved: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    // Test external mapping resolution
    try {
      const dentistMapping = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT get_entity_id_by_external_mapping('dentist_sync', 'HUMBLE_CLINIC', 'clinic') as id
      `;
      testResolutions.push({ type: 'external_mapping', system: 'dentist_sync', resolved: dentistMapping.length > 0 });
    } catch (error) {
      testResolutions.push({ type: 'external_mapping', system: 'dentist_sync', resolved: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    const successfulResolutions = testResolutions.filter(r => r.resolved).length;
    
    phase.success = invalidMappings === 0 && successfulResolutions === testResolutions.length;
    phase.data = {
      valid_mappings: validMappings,
      invalid_mappings: invalidMappings,
      total_mappings: totalMappings,
      test_resolutions: testResolutions,
      successful_resolutions: successfulResolutions,
      total_resolution_tests: testResolutions.length
    };
    
    if (phase.success) {
      phase.details = `Sync resilience validated: ${validMappings}/${totalMappings} mappings valid, ${successfulResolutions}/${testResolutions.length} resolution tests passed`;
    } else {
      if (invalidMappings > 0) phase.errors.push(`${invalidMappings} invalid mappings remain`);
      if (successfulResolutions < testResolutions.length) phase.errors.push(`${testResolutions.length - successfulResolutions} resolution tests failed`);
      
      phase.details = `Sync resilience validation failed: ${phase.errors.join(', ')}`;
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `Resilience validation error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Phase 6: Test external ID resolution
 */
async function testExternalIdResolution(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Test External ID Resolution',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // Test various resolution scenarios
    const resolutionTests = [
      {
        name: 'Dentist Sync - Humble Clinic',
        system: 'dentist_sync',
        external_id: 'HUMBLE_CLINIC',
        entity_type: 'clinic'
      },
      {
        name: 'Dentist Sync - Baytown Clinic',
        system: 'dentist_sync',
        external_id: 'BAYTOWN_CLINIC',
        entity_type: 'clinic'
      },
      {
        name: 'Dentist Sync - Obinna Provider',
        system: 'dentist_sync',
        external_id: 'OBINNA_PROVIDER',
        entity_type: 'provider'
      },
      {
        name: 'Hygienist Sync - Adriane Clinic',
        system: 'hygienist_sync',
        external_id: 'ADRIANE_CLINIC',
        entity_type: 'clinic'
      },
      {
        name: 'Hygienist Sync - Adriane Provider',
        system: 'hygienist_sync',
        external_id: 'ADRIANE_PROVIDER',
        entity_type: 'provider'
      }
    ];
    
    const testResults = [];
    
    for (const test of resolutionTests) {
      try {
        const result = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT get_entity_id_by_external_mapping(${test.system}, ${test.external_id}, ${test.entity_type}) as id
        `;
        
        const resolved = result.length > 0 && result[0].id && result[0].id !== '';
        testResults.push({
          ...test,
          resolved,
          resolved_id: resolved ? result[0].id : null
        });
        
      } catch (error) {
        testResults.push({
          ...test,
          resolved: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const successfulTests = testResults.filter(r => r.resolved).length;
    
    phase.success = successfulTests === resolutionTests.length;
    phase.data = {
      resolution_tests: testResults,
      successful_tests: successfulTests,
      total_tests: resolutionTests.length,
      success_rate: Math.round((successfulTests / resolutionTests.length) * 100)
    };
    
    if (phase.success) {
      phase.details = `External ID resolution successful: ${successfulTests}/${resolutionTests.length} tests passed (100%)`;
    } else {
      const failedTests = testResults.filter(r => !r.resolved);
      phase.errors.push(`${failedTests.length} resolution tests failed`);
      
      failedTests.forEach(test => {
        phase.errors.push(`${test.name}: ${test.error || 'Resolution failed'}`);
      });
      
      phase.details = `External ID resolution failed: ${successfulTests}/${resolutionTests.length} tests passed (${Math.round((successfulTests / resolutionTests.length) * 100)}%)`;
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `External ID resolution test error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Phase 7: Cleanup and restore
 */
async function cleanupAndRestore(): Promise<TestPhase> {
  const phase: TestPhase = {
    name: 'Cleanup and Restore',
    success: false,
    duration: 0,
    details: '',
    errors: []
  };

  try {
    // The post-reseed sync should have already fixed the mappings
    // This phase just verifies cleanup and provides final status
    
    const finalMappingCount = await prisma.externalIdMapping.count();
    const validMappings = await prisma.externalIdMapping.count({
      where: { 
        NOT: { internalId: { startsWith: 'fake_' } }
      }
    });
    
    const cleanupSuccessful = validMappings === finalMappingCount;
    
    phase.success = cleanupSuccessful;
    phase.data = {
      final_mapping_count: finalMappingCount,
      valid_mappings: validMappings,
      cleanup_successful: cleanupSuccessful
    };
    
    if (phase.success) {
      phase.details = `Cleanup successful: All ${finalMappingCount} mappings are valid`;
    } else {
      const invalidCount = finalMappingCount - validMappings;
      phase.errors.push(`${invalidCount} invalid mappings remain after cleanup`);
      phase.details = `Cleanup incomplete: ${invalidCount} invalid mappings remain`;
    }

    return phase;

  } catch (error) {
    phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
    phase.details = `Cleanup error: ${phase.errors[0]}`;
    return phase;
  }
}

/**
 * Generate comprehensive test summary
 */
function generateTestSummary(report: TestReport): string {
  const successfulPhases = report.phases.filter(p => p.success).length;
  const failedPhases = report.phases.filter(p => !p.success);
  
  if (report.overallSuccess) {
    return `✅ SYNC RESILIENCE TEST PASSED\n\n` +
           `🎉 All ${report.phases.length} test phases completed successfully!\n\n` +
           `⏱️ Total Duration: ${report.totalDuration} seconds\n\n` +
           `🛡️ The sync resilience system is working correctly:\n` +
           `• Database reseed simulation successful\n` +
           `• Post-reseed synchronization functional\n` +
           `• External ID resolution working\n` +
           `• All mappings restored to valid state\n\n` +
           `🚀 External sync systems will continue working after database reseeds.`;
  } else {
    return `❌ SYNC RESILIENCE TEST FAILED\n\n` +
           `📊 Test Results: ${successfulPhases}/${report.phases.length} phases passed\n` +
           `⏱️ Total Duration: ${report.totalDuration} seconds\n\n` +
           `💥 Failed Phases:\n` +
           failedPhases.map(p => `• ${p.name}: ${p.errors.join(', ')}`).join('\n') +
           `\n\n⚠️ The sync resilience system requires attention before production use.`;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🧪 Starting Sync Resilience Integration Test...\n');
    
    const report = await runSyncResilienceTest();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 SYNC RESILIENCE INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(report.summary);
    console.log('\n📋 DETAILED PHASE RESULTS:');
    console.log('-'.repeat(40));
    
    report.phases.forEach((phase, index) => {
      const status = phase.success ? '✅' : '❌';
      console.log(`${status} Phase ${index + 1}: ${phase.name}`);
      console.log(`   Duration: ${phase.duration}s`);
      console.log(`   Details: ${phase.details}`);
      if (phase.errors.length > 0) {
        console.log(`   Errors: ${phase.errors.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('='.repeat(80));

    if (!report.overallSuccess) {
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Critical test failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { runSyncResilienceTest, type TestReport, type TestPhase };
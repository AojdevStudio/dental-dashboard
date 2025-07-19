#!/usr/bin/env tsx

/**
 * POST-RESEED SYNCHRONIZATION SCRIPT
 * 
 * Automatically updates external system mappings after database reseed
 * Ensures sync resilience by maintaining cross-system ID relationships
 * 
 * Usage:
 *   pnpm dlx tsx scripts/post-reseed-sync.ts
 *   node scripts/post-reseed-sync.js
 * 
 * @version 1.0.0
 * @requires prisma, @prisma/client
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/lib/utils/logger';

const logger = createLogger({ context: 'PostReseedSync' });
const prisma = new PrismaClient();

interface ReseedSyncReport {
  success: boolean;
  clinicsProcessed: number;
  providersProcessed: number;
  locationsProcessed: number;
  mappingsUpdated: number;
  errors: string[];
  summary: string;
}

/**
 * Main post-reseed synchronization function
 */
async function performPostReseedSync(): Promise<ReseedSyncReport> {
  const report: ReseedSyncReport = {
    success: false,
    clinicsProcessed: 0,
    providersProcessed: 0,
    locationsProcessed: 0,
    mappingsUpdated: 0,
    errors: [],
    summary: ''
  };

  try {
    logger.info('🔄 Starting post-reseed synchronization...');
    
    // Step 1: Update clinic ID mappings
    const clinicUpdates = await updateClinicMappings();
    report.clinicsProcessed = clinicUpdates.processed;
    report.mappingsUpdated += clinicUpdates.mappingsUpdated;
    
    if (clinicUpdates.errors.length > 0) {
      report.errors.push(...clinicUpdates.errors);
    }

    // Step 2: Update provider ID mappings
    const providerUpdates = await updateProviderMappings();
    report.providersProcessed = providerUpdates.processed;
    report.mappingsUpdated += providerUpdates.mappingsUpdated;
    
    if (providerUpdates.errors.length > 0) {
      report.errors.push(...providerUpdates.errors);
    }

    // Step 3: Update location ID mappings
    const locationUpdates = await updateLocationMappings();
    report.locationsProcessed = locationUpdates.processed;
    report.mappingsUpdated += locationUpdates.mappingsUpdated;
    
    if (locationUpdates.errors.length > 0) {
      report.errors.push(...locationUpdates.errors);
    }

    // Step 4: Validate all mappings
    const validationResult = await validateAllMappings();
    if (!validationResult.success) {
      report.errors.push(...validationResult.errors);
    }

    // Determine overall success
    report.success = report.errors.length === 0;
    
    // Generate summary
    report.summary = generateSyncSummary(report);
    
    logger.info('✅ Post-reseed synchronization completed', {
      success: report.success,
      totalMappingsUpdated: report.mappingsUpdated,
      totalErrors: report.errors.length
    });

    return report;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    report.errors.push(`Critical sync error: ${errorMessage}`);
    report.summary = `FAILED: ${errorMessage}`;
    
    logger.error('❌ Post-reseed synchronization failed', { error: errorMessage });
    return report;
  }
}

/**
 * Update clinic ID mappings in external_id_mappings table
 */
async function updateClinicMappings() {
  const result = { processed: 0, mappingsUpdated: 0, errors: [] as string[] };

  try {
    // Get all clinics with clinic codes
    const clinics = await prisma.clinic.findMany({
      where: {
        clinicCode: { not: null }
      },
      select: {
        id: true,
        clinicCode: true,
        name: true
      }
    });

    logger.info(`📋 Processing ${clinics.length} clinics for ID mapping updates`);

    for (const clinic of clinics) {
      try {
        // Update all external mappings for this clinic
        const updateCount = await prisma.externalIdMapping.updateMany({
          where: {
            entityType: 'clinic',
            externalId: {
              in: [
                `${clinic.clinicCode}_CLINIC`,
                'HUMBLE_CLINIC',
                'BAYTOWN_CLINIC',
                'KAMDENTAL_HUMBLE',
                'KAMDENTAL_BAYTOWN'
              ]
            }
          },
          data: {
            internalId: clinic.id
          }
        });

        if (updateCount.count > 0) {
          result.mappingsUpdated += updateCount.count;
          logger.debug(`Updated ${updateCount.count} clinic mappings for ${clinic.name}`);
        }

        result.processed++;

      } catch (error) {
        const errorMessage = `Failed to update clinic mapping for ${clinic.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMessage);
        logger.error(errorMessage);
      }
    }

    return result;

  } catch (error) {
    const errorMessage = `Failed to update clinic mappings: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMessage);
    logger.error(errorMessage);
    return result;
  }
}

/**
 * Update provider ID mappings in external_id_mappings table
 */
async function updateProviderMappings() {
  const result = { processed: 0, mappingsUpdated: 0, errors: [] as string[] };

  try {
    // Get all providers with provider codes
    const providers = await prisma.provider.findMany({
      where: {
        providerCode: { not: null }
      },
      select: {
        id: true,
        providerCode: true,
        firstName: true,
        lastName: true
      }
    });

    logger.info(`👨‍⚕️ Processing ${providers.length} providers for ID mapping updates`);

    for (const provider of providers) {
      try {
        // Update all external mappings for this provider
        const updateCount = await prisma.externalIdMapping.updateMany({
          where: {
            entityType: 'provider',
            externalId: {
              in: [
                `${provider.providerCode}_PROVIDER`,
                'OBINNA_PROVIDER',
                'ADRIANE_PROVIDER',
                'KAMDI_PROVIDER'
              ]
            }
          },
          data: {
            internalId: provider.id
          }
        });

        if (updateCount.count > 0) {
          result.mappingsUpdated += updateCount.count;
          logger.debug(`Updated ${updateCount.count} provider mappings for ${provider.firstName} ${provider.lastName}`);
        }

        result.processed++;

      } catch (error) {
        const errorMessage = `Failed to update provider mapping for ${provider.firstName} ${provider.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMessage);
        logger.error(errorMessage);
      }
    }

    return result;

  } catch (error) {
    const errorMessage = `Failed to update provider mappings: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMessage);
    logger.error(errorMessage);
    return result;
  }
}

/**
 * Update location ID mappings in external_id_mappings table
 */
async function updateLocationMappings() {
  const result = { processed: 0, mappingsUpdated: 0, errors: [] as string[] };

  try {
    // Get all locations with location codes
    const locations = await prisma.location.findMany({
      where: {
        locationCode: { not: null }
      },
      select: {
        id: true,
        locationCode: true,
        name: true
      }
    });

    logger.info(`🏥 Processing ${locations.length} locations for ID mapping updates`);

    for (const location of locations) {
      try {
        // Update all external mappings for this location
        const updateCount = await prisma.externalIdMapping.updateMany({
          where: {
            entityType: 'location',
            externalId: {
              in: [
                `${location.locationCode}_LOCATION`,
                'HUMBLE_LOCATION',
                'BAYTOWN_LOCATION'
              ]
            }
          },
          data: {
            internalId: location.id
          }
        });

        if (updateCount.count > 0) {
          result.mappingsUpdated += updateCount.count;
          logger.debug(`Updated ${updateCount.count} location mappings for ${location.name}`);
        }

        result.processed++;

      } catch (error) {
        const errorMessage = `Failed to update location mapping for ${location.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMessage);
        logger.error(errorMessage);
      }
    }

    return result;

  } catch (error) {
    const errorMessage = `Failed to update location mappings: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMessage);
    logger.error(errorMessage);
    return result;
  }
}

/**
 * Validate all external ID mappings point to valid entities
 */
async function validateAllMappings() {
  const result = { success: true, errors: [] as string[] };

  try {
    logger.info('🔍 Validating all external ID mappings...');

    // Validate clinic mappings
    const clinicMappings = await prisma.externalIdMapping.findMany({
      where: { entityType: 'clinic' },
      include: {
        clinic: {
          select: { id: true, name: true }
        }
      }
    });

    for (const mapping of clinicMappings) {
      if (!mapping.clinic) {
        result.errors.push(`Orphaned clinic mapping: ${mapping.externalId} -> ${mapping.internalId}`);
        result.success = false;
      }
    }

    // Validate provider mappings
    const providerMappings = await prisma.externalIdMapping.findMany({
      where: { entityType: 'provider' },
      include: {
        provider: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    for (const mapping of providerMappings) {
      if (!mapping.provider) {
        result.errors.push(`Orphaned provider mapping: ${mapping.externalId} -> ${mapping.internalId}`);
        result.success = false;
      }
    }

    // Validate location mappings
    const locationMappings = await prisma.externalIdMapping.findMany({
      where: { entityType: 'location' },
      include: {
        location: {
          select: { id: true, name: true }
        }
      }
    });

    for (const mapping of locationMappings) {
      if (!mapping.location) {
        result.errors.push(`Orphaned location mapping: ${mapping.externalId} -> ${mapping.internalId}`);
        result.success = false;
      }
    }

    logger.info(`✅ Validation completed: ${result.success ? 'All mappings valid' : `${result.errors.length} issues found`}`);

    return result;

  } catch (error) {
    const errorMessage = `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMessage);
    result.success = false;
    logger.error(errorMessage);
    return result;
  }
}

/**
 * Generate human-readable sync summary
 */
function generateSyncSummary(report: ReseedSyncReport): string {
  if (!report.success) {
    return `❌ POST-RESEED SYNC FAILED\n\nErrors:\n${report.errors.join('\n')}\n\nPartial Results:\n- Clinics: ${report.clinicsProcessed}\n- Providers: ${report.providersProcessed}\n- Locations: ${report.locationsProcessed}\n- Mappings Updated: ${report.mappingsUpdated}`;
  }

  return `✅ POST-RESEED SYNC SUCCESSFUL\n\nResults:\n- Clinics Processed: ${report.clinicsProcessed}\n- Providers Processed: ${report.providersProcessed}\n- Locations Processed: ${report.locationsProcessed}\n- Total Mappings Updated: ${report.mappingsUpdated}\n\n🔄 All external system mappings are now synchronized with current database IDs.\n🛡️ Sync resilience restored - external systems will continue working normally.`;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Post-Reseed Synchronization Script...\n');
    
    const report = await performPostReseedSync();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 POST-RESEED SYNC REPORT');
    console.log('='.repeat(60));
    console.log(report.summary);
    console.log('='.repeat(60));

    if (!report.success) {
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error in post-reseed sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { performPostReseedSync, type ReseedSyncReport };
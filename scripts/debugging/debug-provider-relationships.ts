#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function examineProviderRelationships() {
  try {
    console.log('🔍 Examining Provider Relationships Database State\n');

    // Query providers table
    console.log('=== PROVIDERS TABLE ===');
    const providers = await prisma.provider.findMany({
      orderBy: { name: 'asc' }
    });
    
    if (providers.length === 0) {
      console.log('❌ No providers found');
    } else {
      console.log(`✅ Found ${providers.length} providers:`);
      providers.forEach(provider => {
        console.log(`  - ${provider.name} (ID: ${provider.id}, Type: ${provider.providerType})`);
      });
    }
    console.log('');

    // Query locations table
    console.log('=== LOCATIONS TABLE ===');
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    });
    
    if (locations.length === 0) {
      console.log('❌ No locations found');
    } else {
      console.log(`✅ Found ${locations.length} locations:`);
      locations.forEach(location => {
        console.log(`  - ${location.name} (ID: ${location.id}, Clinic: ${location.clinicId})`);
      });
    }
    console.log('');

    // Query provider_locations table
    console.log('=== PROVIDER_LOCATIONS TABLE ===');
    const providerLocations = await prisma.providerLocation.findMany({
      include: {
        provider: true,
        location: true
      },
      orderBy: [
        { provider: { name: 'asc' } },
        { location: { name: 'asc' } }
      ]
    });
    
    if (providerLocations.length === 0) {
      console.log('❌ No provider-location relationships found');
    } else {
      console.log(`✅ Found ${providerLocations.length} provider-location relationships:`);
      providerLocations.forEach(rel => {
        console.log(`  - ${rel.provider.name} → ${rel.location.name} (Active: ${rel.isActive})`);
      });
    }
    console.log('');

    // Analysis and recommendations
    console.log('=== ANALYSIS ===');
    
    if (providers.length === 0) {
      console.log('🚨 CRITICAL: No providers in database - seeding failed or incomplete');
    }
    
    if (locations.length === 0) {
      console.log('🚨 CRITICAL: No locations in database - seeding failed or incomplete');
    }
    
    if (providers.length > 0 && locations.length > 0 && providerLocations.length === 0) {
      console.log('🚨 ISSUE FOUND: Providers and locations exist but no relationships are defined');
      console.log('   This could cause Google Apps Script sync issues if it expects provider data');
      console.log('   The seed file may not be creating provider_location relationships');
    }
    
    if (providerLocations.length > 0) {
      console.log('✅ Provider-location relationships exist');
      
      // Check for orphaned relationships
      const activeRelationships = providerLocations.filter(rel => rel.isActive);
      const inactiveRelationships = providerLocations.filter(rel => !rel.isActive);
      
      console.log(`   - Active relationships: ${activeRelationships.length}`);
      console.log(`   - Inactive relationships: ${inactiveRelationships.length}`);
    }

    // Show potential seeding requirements
    console.log('\n=== SEEDING RECOMMENDATIONS ===');
    
    if (providers.length > 0 && locations.length > 0 && providerLocations.length === 0) {
      console.log('Recommended seeding actions:');
      console.log('1. Create provider_location relationships for existing providers and locations');
      console.log('2. Review seed file to ensure it creates these relationships');
      
      // Show what relationships could be created
      console.log('\nPotential relationships to create:');
      for (const provider of providers) {
        for (const location of locations) {
          console.log(`  - ${provider.name} → ${location.name}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error examining provider relationships:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the examination
examineProviderRelationships().catch(console.error);
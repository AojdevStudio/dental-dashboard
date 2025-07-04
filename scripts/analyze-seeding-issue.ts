#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeSeeding() {
  try {
    console.log('🔍 Analyzing Seeding Issue\n');

    // Get current state
    const providers = await prisma.provider.findMany({
      include: {
        clinic: true,
        providerLocations: {
          include: {
            location: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const locations = await prisma.location.findMany({
      include: {
        clinic: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('=== CURRENT PROVIDER-LOCATION MAPPING ===');
    providers.forEach(provider => {
      console.log(`\n${provider.name} (${provider.providerType || 'unknown type'}):`);
      console.log(`  Primary Clinic: ${provider.clinic.name}`);
      console.log(`  Assigned Locations:`);
      
      if (provider.providerLocations.length === 0) {
        console.log(`    ❌ No location assignments found`);
      } else {
        provider.providerLocations.forEach(pl => {
          console.log(`    ✅ ${pl.location.name} (Active: ${pl.isActive})`);
        });
      }
    });

    console.log('\n=== EXPECTED PROVIDER-LOCATION RELATIONSHIPS ===');
    console.log('Based on CSV data and business logic:');
    
    // Based on the seed file comments and data
    const expectedRelationships = [
      { provider: 'Kamdi Irondi', locations: ['Humble', 'Baytown'], reason: 'Works at both locations' },
      { provider: 'Chinyere Enih', locations: ['Humble'], reason: 'Primary at Humble' },
      { provider: 'Obinna Ezeji', locations: ['Baytown'], reason: 'Primary at Baytown' },
      { provider: 'Adriane Fontenot', locations: ['Baytown'], reason: 'Hygienist at Baytown' },
      { provider: 'Kia Redfearn', locations: ['Humble'], reason: 'Hygienist at Humble' },
    ];

    expectedRelationships.forEach(expected => {
      console.log(`\n${expected.provider}:`);
      console.log(`  Expected: ${expected.locations.join(', ')} (${expected.reason})`);
      
      const provider = providers.find(p => p.name === expected.provider);
      if (provider) {
        const actualLocations = provider.providerLocations.map(pl => pl.location.name);
        const missing = expected.locations.filter(loc => !actualLocations.includes(loc));
        const extra = actualLocations.filter(loc => !expected.locations.includes(loc));
        
        if (missing.length > 0) {
          console.log(`  ❌ Missing: ${missing.join(', ')}`);
        }
        if (extra.length > 0) {
          console.log(`  ⚠️  Extra: ${extra.join(', ')}`);
        }
        if (missing.length === 0 && extra.length === 0) {
          console.log(`  ✅ Correctly assigned`);
        }
      } else {
        console.log(`  ❌ Provider not found in database`);
      }
    });

    console.log('\n=== SEEDING ISSUE ANALYSIS ===');
    
    // Check if seed file creates provider_location relationships
    console.log('Issue: The seed file (prisma/seed.ts) creates:');
    console.log('✅ Clinics');
    console.log('✅ Locations'); 
    console.log('✅ Providers');
    console.log('❌ Provider-Location relationships (missing!)');
    
    console.log('\nThis means:');
    console.log('- Providers exist but have no location assignments');
    console.log('- Google Apps Script may expect provider data by location');
    console.log('- Queries filtering by provider + location will return empty results');

    console.log('\n=== RECOMMENDED FIXES ===');
    console.log('1. Add provider-location relationship creation to seed file');
    console.log('2. Create a separate script to populate missing relationships');
    console.log('3. Update Google Apps Script to handle missing relationships gracefully');

    // Generate SQL to fix current relationships
    console.log('\n=== QUICK FIX SQL ===');
    console.log('Run this to create missing relationships:');
    
    const humbleLocation = locations.find(l => l.name === 'Humble');
    const baytownLocation = locations.find(l => l.name === 'Baytown');
    
    if (humbleLocation && baytownLocation) {
      expectedRelationships.forEach(expected => {
        const provider = providers.find(p => p.name === expected.provider);
        if (provider) {
          expected.locations.forEach(locationName => {
            const location = locationName === 'Humble' ? humbleLocation : baytownLocation;
            const exists = provider.providerLocations.some(pl => pl.locationId === location.id);
            
            if (!exists) {
              console.log(`INSERT INTO provider_locations (provider_id, location_id, is_active) VALUES ('${provider.id}', '${location.id}', true);`);
            }
          });
        }
      });
    }

  } catch (error) {
    console.error('❌ Error analyzing seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeSeeding().catch(console.error);
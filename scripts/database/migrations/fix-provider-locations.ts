#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProviderLocations() {
  try {
    console.log('🔧 Fixing Provider-Location Relationships\n');

    // Get current data
    const providers = await prisma.provider.findMany({
      include: {
        clinic: true
      }
    });

    const locations = await prisma.location.findMany({
      include: {
        clinic: true
      }
    });

    const humbleLocation = locations.find(l => l.name === 'Humble');
    const baytownLocation = locations.find(l => l.name === 'Baytown');

    if (!humbleLocation || !baytownLocation) {
      throw new Error('❌ Could not find Humble or Baytown locations');
    }

    console.log('Found locations:');
    console.log(`- Humble: ${humbleLocation.id}`);
    console.log(`- Baytown: ${baytownLocation.id}\n`);

    // Define correct provider-location relationships based on business requirements
    const correctRelationships = [
      { providerName: 'Kamdi Irondi', locations: ['Humble', 'Baytown'] },      // Works at both
      { providerName: 'Chinyere Enih', locations: ['Humble'] },               // Primary at Humble
      { providerName: 'Obinna Ezeji', locations: ['Baytown'] },               // Primary at Baytown (fix: remove Humble)
      { providerName: 'Adriane Fontenot', locations: ['Baytown'] },           // Hygienist at Baytown
      { providerName: 'Kia Redfearn', locations: ['Humble'] },                // Hygienist at Humble
    ];

    console.log('=== FIXING PROVIDER-LOCATION RELATIONSHIPS ===\n');

    for (const relationship of correctRelationships) {
      const provider = providers.find(p => p.name === relationship.providerName);
      
      if (!provider) {
        console.log(`❌ Provider not found: ${relationship.providerName}`);
        continue;
      }

      console.log(`🔧 Fixing ${provider.name}:`);

      // First, remove all existing relationships for this provider
      const deleted = await prisma.providerLocation.deleteMany({
        where: {
          providerId: provider.id
        }
      });
      
      if (deleted.count > 0) {
        console.log(`  🗑️  Removed ${deleted.count} existing relationships`);
      }

      // Then create the correct relationships
      for (const locationName of relationship.locations) {
        const location = locationName === 'Humble' ? humbleLocation : baytownLocation;
        
        await prisma.providerLocation.create({
          data: {
            providerId: provider.id,
            locationId: location.id,
            isActive: true,
            startDate: new Date(), // Set current date as start date
            isPrimary: false // Default to false, can be updated later if needed
          }
        });
        
        console.log(`  ✅ Added: ${provider.name} → ${locationName}`);
      }
      
      console.log('');
    }

    // Verify the fixes
    console.log('=== VERIFICATION ===\n');
    
    const updatedProviders = await prisma.provider.findMany({
      include: {
        providerLocations: {
          include: {
            location: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    updatedProviders.forEach(provider => {
      console.log(`${provider.name}:`);
      if (provider.providerLocations.length === 0) {
        console.log(`  ❌ No locations assigned`);
      } else {
        provider.providerLocations.forEach(pl => {
          console.log(`  ✅ ${pl.location.name} (Active: ${pl.isActive})`);
        });
      }
    });

    console.log('\n✅ Provider-location relationships have been fixed!');
    console.log('\nThis should resolve Google Apps Script sync issues related to provider data.');

  } catch (error) {
    console.error('❌ Error fixing provider locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProviderLocations().catch(console.error);
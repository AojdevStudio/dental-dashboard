#!/usr/bin/env tsx

/**
 * Verification Script: Provider-Location Relationships
 * 
 * This script verifies that the provider-location relationships were created correctly
 * in the database after seeding. It checks:
 * 1. Total count of relationships
 * 2. Lists all relationships with provider name, location name, and isPrimary status
 * 3. Verifies the expected 6 relationships exist as specified in the seed file
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyProviderLocationRelationships() {
  console.log('🔍 Verifying Provider-Location Relationships...\n');

  try {
    // 1. Get total count of relationships
    const totalCount = await prisma.providerLocation.count();
    console.log(`📊 Total Provider-Location Relationships: ${totalCount}\n`);

    // 2. Get all relationships with detailed information
    const relationships = await prisma.providerLocation.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            providerType: true,
          }
        },
        location: {
          include: {
            clinic: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: [
        { provider: { name: 'asc' } },
        { location: { name: 'asc' } }
      ]
    });

    console.log('📋 All Provider-Location Relationships:');
    console.log('=' .repeat(80));
    
    relationships.forEach((rel, index) => {
      const status = rel.isActive ? '✅ Active' : '❌ Inactive';
      const primary = rel.isPrimary ? '🌟 Primary' : '📍 Secondary';
      
      console.log(`${index + 1}. ${rel.provider.name} (${rel.provider.providerType})`);
      console.log(`   Location: ${rel.location.name} (${rel.location.clinic.name})`);
      console.log(`   Status: ${status} | ${primary}`);
      console.log(`   Email: ${rel.provider.email || 'N/A'}`);
      console.log(`   Start Date: ${rel.startDate.toDateString()}`);
      console.log();
    });

    // 3. Verify expected relationships from seed file
    console.log('🎯 Expected Relationships Verification:');
    console.log('=' .repeat(50));

    const expectedRelationships = [
      { providerName: 'Kamdi Irondi', locationName: 'Humble', isPrimary: true },
      { providerName: 'Kamdi Irondi', locationName: 'Baytown', isPrimary: false },
      { providerName: 'Chinyere Enih', locationName: 'Humble', isPrimary: true },
      { providerName: 'Obinna Ezeji', locationName: 'Baytown', isPrimary: true },
      { providerName: 'Adriane Fontenot', locationName: 'Baytown', isPrimary: true },
      { providerName: 'Kia Redfearn', locationName: 'Humble', isPrimary: true },
    ];

    let foundCount = 0;
    let missingRelationships: typeof expectedRelationships = [];

    for (const expected of expectedRelationships) {
      const found = relationships.find(rel => 
        rel.provider.name === expected.providerName &&
        rel.location.name === expected.locationName &&
        rel.isPrimary === expected.isPrimary
      );

      if (found) {
        console.log(`✅ Found: ${expected.providerName} -> ${expected.locationName} (primary: ${expected.isPrimary})`);
        foundCount++;
      } else {
        console.log(`❌ Missing: ${expected.providerName} -> ${expected.locationName} (primary: ${expected.isPrimary})`);
        missingRelationships.push(expected);
      }
    }

    console.log('\n📈 Summary:');
    console.log('=' .repeat(30));
    console.log(`Expected relationships: ${expectedRelationships.length}`);
    console.log(`Found relationships: ${foundCount}`);
    console.log(`Total relationships in DB: ${totalCount}`);
    console.log(`Missing relationships: ${missingRelationships.length}`);

    if (foundCount === expectedRelationships.length && totalCount === expectedRelationships.length) {
      console.log('\n🎉 SUCCESS: All expected provider-location relationships are correctly created!');
    } else if (foundCount === expectedRelationships.length && totalCount > expectedRelationships.length) {
      console.log('\n⚠️ WARNING: All expected relationships found, but there are additional relationships in the database.');
      console.log('This might be normal if relationships were created outside the seed file.');
    } else {
      console.log('\n❌ ISSUE: Some expected relationships are missing or incorrect.');
      
      if (missingRelationships.length > 0) {
        console.log('\nMissing relationships:');
        missingRelationships.forEach(missing => {
          console.log(`  - ${missing.providerName} -> ${missing.locationName} (primary: ${missing.isPrimary})`);
        });
      }
    }

    // 4. Additional validations
    console.log('\n🔍 Additional Validations:');
    console.log('=' .repeat(40));

    // Check for providers with multiple primary locations
    const providersWithMultiplePrimary = await prisma.provider.findMany({
      where: {
        providerLocations: {
          some: {
            isPrimary: true
          }
        }
      },
      include: {
        providerLocations: {
          where: { isPrimary: true },
          include: {
            location: true
          }
        }
      }
    });

    const providersWithTooManyPrimary = providersWithMultiplePrimary.filter(
      provider => provider.providerLocations.length > 1
    );

    if (providersWithTooManyPrimary.length > 0) {
      console.log('⚠️ Warning: Providers with multiple primary locations:');
      providersWithTooManyPrimary.forEach(provider => {
        console.log(`  - ${provider.name}: ${provider.providerLocations.length} primary locations`);
      });
    } else {
      console.log('✅ All providers have at most one primary location');
    }

    // Check for inactive relationships
    const inactiveCount = relationships.filter(rel => !rel.isActive).length;
    console.log(`📊 Inactive relationships: ${inactiveCount}`);

    console.log('\n✨ Verification completed successfully!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyProviderLocationRelationships()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { verifyProviderLocationRelationships };
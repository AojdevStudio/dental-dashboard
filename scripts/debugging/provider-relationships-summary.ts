#!/usr/bin/env tsx

/**
 * Provider-Location Relationships Summary
 * 
 * Quick summary of provider-location relationships in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function summarizeProviderRelationships() {
  console.log('🏥 Provider-Location Relationships Summary\n');

  try {
    const relationships = await prisma.providerLocation.findMany({
      include: {
        provider: {
          select: {
            name: true,
            providerType: true,
          }
        },
        location: {
          select: {
            name: true,
          }
        }
      },
      orderBy: [
        { provider: { name: 'asc' } },
        { location: { name: 'asc' } }
      ]
    });

    const totalCount = relationships.length;
    const activeCount = relationships.filter(r => r.isActive).length;
    const primaryCount = relationships.filter(r => r.isPrimary).length;

    console.log(`📊 Quick Stats:`);
    console.log(`   Total relationships: ${totalCount}`);
    console.log(`   Active relationships: ${activeCount}`);
    console.log(`   Primary relationships: ${primaryCount}\n`);

    console.log('📋 Relationships by Provider:');
    console.log('─'.repeat(60));

    // Group by provider
    const groupedByProvider = relationships.reduce((acc, rel) => {
      if (!acc[rel.provider.name]) {
        acc[rel.provider.name] = {
          type: rel.provider.providerType,
          locations: []
        };
      }
      acc[rel.provider.name].locations.push({
        name: rel.location.name,
        isPrimary: rel.isPrimary,
        isActive: rel.isActive
      });
      return acc;
    }, {} as Record<string, { type: string, locations: Array<{ name: string, isPrimary: boolean, isActive: boolean }> }>);

    for (const [providerName, data] of Object.entries(groupedByProvider)) {
      console.log(`\n👤 ${providerName} (${data.type})`);
      data.locations.forEach(loc => {
        const primary = loc.isPrimary ? ' [PRIMARY]' : '';
        const status = loc.isActive ? '✅' : '❌';
        console.log(`   ${status} ${loc.name}${primary}`);
      });
    }

    console.log('\n📍 Relationships by Location:');
    console.log('─'.repeat(60));

    // Group by location
    const groupedByLocation = relationships.reduce((acc, rel) => {
      if (!acc[rel.location.name]) {
        acc[rel.location.name] = [];
      }
      acc[rel.location.name].push({
        providerName: rel.provider.name,
        providerType: rel.provider.providerType,
        isPrimary: rel.isPrimary,
        isActive: rel.isActive
      });
      return acc;
    }, {} as Record<string, Array<{ providerName: string, providerType: string, isPrimary: boolean, isActive: boolean }>>);

    for (const [locationName, providers] of Object.entries(groupedByLocation)) {
      console.log(`\n📍 ${locationName} Location`);
      providers.forEach(provider => {
        const primary = provider.isPrimary ? ' [PRIMARY]' : '';
        const status = provider.isActive ? '✅' : '❌';
        console.log(`   ${status} ${provider.providerName} (${provider.providerType})${primary}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the summary
summarizeProviderRelationships()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
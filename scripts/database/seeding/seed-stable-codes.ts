#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SeedData {
  clinics: Array<{ id: string; name: string; stableCode: string }>
  providers: Array<{ id: string; name: string; stableCode: string; clinicId: string }>
  locations: Array<{ id: string; name: string; stableCode: string; clinicId: string }>
  externalMappings: Array<{
    system: string
    externalId: string
    entityType: string
    entityId: string
    notes: string
  }>
}

async function seedStableCodes() {
  console.log('🌱 Starting Phase 1.4: Seeding stable codes and external mappings...')
  
  try {
    // Get current data
    const clinics = await prisma.clinic.findMany()
    const providers = await prisma.provider.findMany()
    const locations = await prisma.location.findMany()
    
    console.log(`📊 Found: ${clinics.length} clinics, ${providers.length} providers, ${locations.length} locations`)
    
    // Define stable codes mapping
    const seedData: SeedData = {
      clinics: [
        {
          id: 'cmc3jcrhe0000i2ht9ymqtmzb', // KamDental Humble
          name: 'KamDental Humble',
          stableCode: 'KAMDENTAL_HUMBLE'
        },
        {
          id: 'cmc3jcrs20001i2ht5sn89v66', // KamDental Baytown
          name: 'KamDental Baytown', 
          stableCode: 'KAMDENTAL_BAYTOWN'
        }
      ],
      providers: [
        {
          id: 'cmc3jcsim0008i2hthvfmfv93', // Kamdi Irondi
          name: 'Kamdi Irondi',
          stableCode: 'kamdi_irondi',
          clinicId: 'cmc3jcrhe0000i2ht9ymqtmzb'
        },
        {
          id: 'cmc3jcsw2000ai2ht9v9j97h4', // Chinyere Enih
          name: 'Chinyere Enih',
          stableCode: 'chinyere_enih',
          clinicId: 'cmc3jcrhe0000i2ht9ymqtmzb'
        },
        {
          id: 'cmc3jct7h000ci2ht3925vf19', // Obinna Ezeji
          name: 'Obinna Ezeji',
          stableCode: 'obinna_ezeji',
          clinicId: 'cmc3jcrs20001i2ht5sn89v66'
        },
        {
          id: 'cmc3jctl1000ei2ht3mpp56ok', // Adriane Fontenot
          name: 'Adriane Fontenot',
          stableCode: 'adriane_fontenot',
          clinicId: 'cmc3jcrs20001i2ht5sn89v66'
        },
        {
          id: 'cmc3jctyd000gi2htj0ggsxei', // Kia Redfearn
          name: 'Kia Redfearn',
          stableCode: 'kia_redfearn',
          clinicId: 'cmc3jcrhe0000i2ht9ymqtmzb'
        }
      ],
      locations: [
        {
          id: 'cmc3jcrxv0004i2ht5zwwjoq5', // Humble
          name: 'Humble',
          stableCode: 'HUMBLE_MAIN',
          clinicId: 'cmc3jcrhe0000i2ht9ymqtmzb'
        },
        {
          id: 'cmc3jcrxv0005i2htozf4fz1d', // Baytown
          name: 'Baytown',
          stableCode: 'BAYTOWN_MAIN',
          clinicId: 'cmc3jcrs20001i2ht5sn89v66'
        }
      ],
      externalMappings: [
        // Dentist sync mappings (dual-location system)
        {
          system: 'dentist_sync',
          externalId: 'HUMBLE_CLINIC',
          entityType: 'clinic',
          entityId: 'cmc3jcrhe0000i2ht9ymqtmzb',
          notes: 'Dentist sync Humble clinic mapping'
        },
        {
          system: 'dentist_sync',
          externalId: 'BAYTOWN_CLINIC',
          entityType: 'clinic',
          entityId: 'cmc3jcrs20001i2ht5sn89v66',
          notes: 'Dentist sync Baytown clinic mapping'
        },
        {
          system: 'dentist_sync',
          externalId: 'OBINNA_PROVIDER',
          entityType: 'provider',
          entityId: 'cmc3jct7h000ci2ht3925vf19',
          notes: 'Dentist sync primary provider (Dr. Obinna Ezeji)'
        },
        {
          system: 'dentist_sync',
          externalId: 'HUMBLE_LOCATION',
          entityType: 'location',
          entityId: 'cmc3jcrxv0004i2ht5zwwjoq5',
          notes: 'Dentist sync Humble location'
        },
        {
          system: 'dentist_sync',
          externalId: 'BAYTOWN_LOCATION',
          entityType: 'location',
          entityId: 'cmc3jcrxv0005i2htozf4fz1d',
          notes: 'Dentist sync Baytown location'
        },
        
        // Hygienist sync mappings (provider-specific system)
        {
          system: 'hygienist_sync',
          externalId: 'ADRIANE_CLINIC',
          entityType: 'clinic',
          entityId: 'cmc3jcrs20001i2ht5sn89v66',
          notes: 'Hygienist sync clinic for Adriane'
        },
        {
          system: 'hygienist_sync',
          externalId: 'ADRIANE_PROVIDER',
          entityType: 'provider',
          entityId: 'cmc3jctl1000ei2ht3mpp56ok',
          notes: 'Hygienist sync provider (Adriane Fontenot)'
        },
        
        // Future expansion mappings
        {
          system: 'location_sync',
          externalId: 'MAIN_CLINIC_NETWORK',
          entityType: 'clinic',
          entityId: 'cmc3jcrhe0000i2ht9ymqtmzb',
          notes: 'Location sync main clinic network identifier'
        }
      ]
    }
    
    // Step 1: Update clinic codes
    console.log('🏥 Updating clinic codes...')
    for (const clinic of seedData.clinics) {
      await prisma.clinic.update({
        where: { id: clinic.id },
        data: { clinicCode: clinic.stableCode }
      })
      console.log(`  ✓ ${clinic.name} → ${clinic.stableCode}`)
    }
    
    // Step 2: Update provider codes
    console.log('👨‍⚕️ Updating provider codes...')
    for (const provider of seedData.providers) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { providerCode: provider.stableCode }
      })
      console.log(`  ✓ ${provider.name} → ${provider.stableCode}`)
    }
    
    // Step 3: Update location codes
    console.log('📍 Updating location codes...')
    for (const location of seedData.locations) {
      await prisma.location.update({
        where: { id: location.id },
        data: { locationCode: location.stableCode }
      })
      console.log(`  ✓ ${location.name} → ${location.stableCode}`)
    }
    
    // Step 4: Create external ID mappings
    console.log('🔗 Creating external ID mappings...')
    for (const mapping of seedData.externalMappings) {
      await prisma.externalIdMapping.create({
        data: {
          externalSystem: mapping.system,
          externalIdentifier: mapping.externalId,
          entityType: mapping.entityType,
          entityId: mapping.entityId,
          isActive: true,
          notes: mapping.notes
        }
      })
      console.log(`  ✓ ${mapping.system}:${mapping.externalId} → ${mapping.entityType}:${mapping.entityId}`)
    }
    
    // Step 5: Test the new functions
    console.log('🧪 Testing lookup functions...')
    
    // Test clinic lookup by code
    const humbleClinicId = await prisma.$queryRaw`SELECT get_clinic_id_by_code('KAMDENTAL_HUMBLE') as result`
    console.log('  ✓ Clinic lookup by code:', humbleClinicId)
    
    // Test provider lookup by code
    const adrianeProviderId = await prisma.$queryRaw`SELECT get_provider_id_by_code('adriane_fontenot') as result`
    console.log('  ✓ Provider lookup by code:', adrianeProviderId)
    
    // Test external mapping lookup
    const externalLookup = await prisma.$queryRaw`SELECT get_entity_id_by_external_mapping('hygienist_sync', 'ADRIANE_PROVIDER', 'provider') as result`
    console.log('  ✓ External mapping lookup:', externalLookup)
    
    // Step 6: Verify all mappings
    console.log('📋 Verifying all external mappings...')
    const allMappings = await prisma.$queryRaw`SELECT * FROM get_system_mappings('dentist_sync')`
    console.log('  ✓ Dentist sync mappings:', allMappings)
    
    const hygieneMapping = await prisma.$queryRaw`SELECT * FROM get_system_mappings('hygienist_sync')`
    console.log('  ✓ Hygienist sync mappings:', hygieneMapping)
    
    console.log('✅ Phase 1.4 completed successfully!')
    console.log('🎯 Ready for Phase 2: Updating Google Apps Script configurations')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedStableCodes()
  .catch((error) => {
    console.error('Seeding script failed:', error)
    process.exit(1)
  })
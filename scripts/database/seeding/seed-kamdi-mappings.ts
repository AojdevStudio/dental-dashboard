import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedKamdiMappings() {
  console.log('🗺️ Creating external mappings for Dr. Kamdi Irondi...');
  
  // Get Dr. Kamdi's data
  const kamdi = await prisma.provider.findUnique({
    where: { providerCode: 'kamdi_irondi' }
  });
  
  if (!kamdi) {
    console.log('❌ Dr. Kamdi not found');
    return;
  }
  
  // Create external mapping for Kamdi in dentist_sync system
  await prisma.externalIdMapping.upsert({
    where: {
      externalSystem_externalIdentifier_entityType: {
        externalSystem: 'dentist_sync',
        externalIdentifier: 'KAMDI_PROVIDER',
        entityType: 'provider'
      }
    },
    update: {
      entityId: kamdi.id,
      isActive: true
    },
    create: {
      externalSystem: 'dentist_sync',
      externalIdentifier: 'KAMDI_PROVIDER',
      entityType: 'provider',
      entityId: kamdi.id,
      isActive: true,
      notes: 'Dr. Kamdi Irondi - Multi-location dentist'
    }
  });
  
  console.log('✅ Created KAMDI_PROVIDER external mapping');
  
  // Verify all dentist_sync mappings
  const allMappings = await prisma.externalIdMapping.findMany({
    where: { externalSystem: 'dentist_sync' },
    orderBy: [{ entityType: 'asc' }, { externalIdentifier: 'asc' }]
  });
  
  console.log('\n=== ALL DENTIST_SYNC MAPPINGS ===');
  allMappings.forEach(mapping => {
    console.log(`${mapping.externalIdentifier} → ${mapping.entityType}:${mapping.entityId.substring(0, 8)}... (${mapping.isActive ? 'Active' : 'Inactive'})`);
  });
}

seedKamdiMappings()
  .catch(console.error)
  .finally(() => process.exit(0));
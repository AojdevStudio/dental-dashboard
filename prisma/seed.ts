import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create the two KamDental clinics
  const clinics = await Promise.all([
    prisma.clinic.upsert({
      where: { registrationCode: 'KAMDENTAL-HUMBLE' },
      update: {},
      create: {
        name: 'KamDental Humble',
        location: 'Humble, TX',
        status: 'active',
        registrationCode: 'KAMDENTAL-HUMBLE',
        uuidId: 'clinic-humble-uuid-001' // Stable UUID for development
      }
    }),
    prisma.clinic.upsert({
      where: { registrationCode: 'KAMDENTAL-BAYTOWN' },
      update: {},
      create: {
        name: 'KamDental Baytown', 
        location: 'Baytown, TX',
        status: 'active',
        registrationCode: 'KAMDENTAL-BAYTOWN',
        uuidId: 'clinic-baytown-uuid-001' // Stable UUID for development
      }
    })
  ])

  console.log('✅ Created clinics:', clinics.map(c => `${c.name} (${c.id})`))

  // Create initial admin user for Humble clinic
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kamdental.com' },
    update: {},
    create: {
      email: 'admin@kamdental.com',
      name: 'KamDental Admin',
      role: 'admin',
      clinicId: clinics[0].id, // Humble clinic
      uuidId: 'user-admin-uuid-001'
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Providers will be created through the Google Apps Script setup process
  // when real users connect their spreadsheets with their actual names
  console.log('✅ Clinic structure ready for provider setup through Apps Script')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
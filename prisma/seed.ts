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

  // Create system admin user with access to all clinics (not tied to specific clinic)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kamdental.com' },
    update: {},
    create: {
      email: 'admin@kamdental.com',
      name: 'KamDental System Admin',
      role: 'system_admin',
      authId: 'e48f8f72-542f-4d1d-9674-6b59d5855996', // Supabase auth UID
      uuidId: 'user-admin-uuid-001'
      // clinicId omitted - system admin not tied to any specific clinic
    } as any // Type assertion to bypass Prisma's strict typing for this system admin case
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Providers will be created through the Google Apps Script setup process
  // when real users connect their spreadsheets with their actual names
  console.log('✅ Clinic structure ready for provider setup through Apps Script')

  console.log('⚙️ Applying service_role permissions...')

  // Grant usage on public schema to service_role
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO service_role;`);
  console.log('Granted USAGE ON SCHEMA public TO service_role.');

  // List all tables that service_role needs access to
  // Ensure this list is kept up-to-date with your schema.prisma
  const tablesToGrantPermissions = [
    "clinics", "users", "providers", "metric_definitions", 
    "data_sources", "column_mappings", "metric_values", "goals",
    "dashboards", "widgets", "user_clinic_roles", "goal_templates",
    "financial_metrics", "appointment_metrics", "call_metrics",
    "patient_metrics", "metric_aggregations", "google_credentials",
    "spreadsheet_connections", "column_mappings_v2",
    "hygiene_production", "dentist_production", "id_mappings"
    // Add any new table names here as your schema evolves
  ];

  for (const table of tablesToGrantPermissions) {
    try {
      await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."${table}" TO service_role;`);
      console.log(`Granted CRUD permissions on public."${table}" to service_role.`);
    } catch (error) {
      console.error(`Failed to grant permissions on table public."${table}":`, error);
    }
  }
  
  // Grant permissions on all sequences in the public schema to service_role.
  // This is important if service_role interacts with tables that use auto-incrementing IDs.
  try {
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;`);
    console.log('Granted USAGE, SELECT, UPDATE ON ALL SEQUENCES in public schema to service_role.');
  } catch (error) {
    console.error('Failed to grant permissions on sequences in public schema:', error);
  }

  console.log('✅ Service_role permissions application step completed.')

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
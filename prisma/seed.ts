import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Upsert the two KamDental clinics (idempotent)
  const clinics = await Promise.all([
    prisma.clinic.upsert({
      where: { registrationCode: 'KAMDENTAL-HUMBLE' },
      update: {
        name: 'KamDental Humble',
        location: 'Humble, TX',
        status: 'active',
      },
      create: {
        name: 'KamDental Humble',
        location: 'Humble, TX',
        status: 'active',
        registrationCode: 'KAMDENTAL-HUMBLE',
      }
    }),
    prisma.clinic.upsert({
      where: { registrationCode: 'KAMDENTAL-BAYTOWN' },
      update: {
        name: 'KamDental Baytown', 
        location: 'Baytown, TX',
        status: 'active',
      },
      create: {
        name: 'KamDental Baytown', 
        location: 'Baytown, TX',
        status: 'active',
        registrationCode: 'KAMDENTAL-BAYTOWN',
      }
    })
  ])

  console.log('✅ Upserted clinics:', clinics.map(c => `${c.name} (${c.id})`))

  // Create locations for each clinic (idempotent)
  const locations = await Promise.all([
    // Humble locations
    prisma.location.upsert({
      where: { 
        clinicId_name: {
          clinicId: clinics[0].id,
          name: 'Humble'
        }
      },
      update: {
        address: 'Humble, TX',
        isActive: true,
      },
      create: {
        clinicId: clinics[0].id,
        name: 'Humble',
        address: 'Humble, TX',
        isActive: true,
      }
    }),
    // Baytown locations
    prisma.location.upsert({
      where: { 
        clinicId_name: {
          clinicId: clinics[1].id,
          name: 'Baytown'
        }
      },
      update: {
        address: 'Baytown, TX',
        isActive: true,
      },
      create: {
        clinicId: clinics[1].id,
        name: 'Baytown',
        address: 'Baytown, TX',
        isActive: true,
      }
    })
  ])

  console.log('✅ Upserted locations:', locations.map(l => `${l.name} (${l.id})`))

  // Upsert system admin user (idempotent)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kamdental.com' },
    update: {
      name: 'KamDental System Admin',
      role: 'system_admin',
    },
    create: {
      email: 'admin@kamdental.com',
      name: 'KamDental System Admin',
      role: 'system_admin',
      authId: 'e48f8f72-542f-4d1d-9674-6b59d5855996'
    } 
  })

  console.log('✅ Upserted admin user:', adminUser.email)

  // Provider data derived from "Provider table - Sheet1 (1).csv"
  // Fixed to create one provider per person with primary clinic assignment
  const providersFromCSV = [
    { firstName: 'Kamdi', lastName: 'Irondi', email: 'k.irondi@kamdental.com', providerType: 'dentist', primaryClinic: 'Humble' }, // Primary at Humble, works at both
    { firstName: 'Chinyere', lastName: 'Enih', email: 'cc.enihdds@gmail.com', providerType: 'dentist', primaryClinic: 'Humble' },
    { firstName: 'Obinna', lastName: 'Ezeji', email: 'obinna.ezeji.dds@gmail.com', providerType: 'dentist', primaryClinic: 'Baytown' },
    { firstName: 'Adriane', lastName: 'Fontenot', email: 'adrianesmile@gmail.com', providerType: 'hygienist', primaryClinic: 'Baytown' },
    { firstName: 'Kia', lastName: 'Redfearn', email: null, providerType: 'hygienist', primaryClinic: 'Humble' },
  ];

  const humbleClinic = clinics.find(c => c.name === 'KamDental Humble');
  const baytownClinic = clinics.find(c => c.name === 'KamDental Baytown');

  if (!humbleClinic || !baytownClinic) {
    console.error('❌ KamDental Humble or KamDental Baytown clinic not found. Cannot seed providers based on CSV data.');
  } else {
    console.log(`ℹ️ Seeding providers with primary clinic assignments (one record per provider)...`);

    for (const providerCsvData of providersFromCSV) {
      const { firstName, lastName, email, providerType, primaryClinic } = providerCsvData;
      const fullName = `${firstName} ${lastName}`;

      // Determine primary clinic ID
      let primaryClinicId;
      if (primaryClinic === 'Humble') {
        primaryClinicId = humbleClinic.id;
      } else if (primaryClinic === 'Baytown') {
        primaryClinicId = baytownClinic.id;
      } else {
        console.warn(`⚠️ Provider ${fullName} has an unrecognized primary clinic: '${primaryClinic}'. Skipping this provider.`);
        continue;
      }

      const providerDataPayload = {
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        providerType: providerType,
        status: 'active',
        clinicId: primaryClinicId,
      };

      try {
        // Use email as unique identifier to prevent duplicates
        const existingProvider = email 
          ? await prisma.provider.findUnique({ where: { email: email } })
          : await prisma.provider.findFirst({
              where: {
                firstName: firstName,
                lastName: lastName,
                providerType: providerType,
              },
            });

        if (existingProvider) {
          // Provider exists, update them
          const updated = await prisma.provider.update({
            where: { id: existingProvider.id },
            data: {
              name: fullName,
              email: email,
              clinicId: primaryClinicId, // Update primary clinic if needed
            },
          });
          console.log(`✅ Updated provider: ${updated.name} (Primary: ${primaryClinic}, ID: ${updated.id})`);
        } else {
          // Provider does not exist, create them
          const created = await prisma.provider.create({
            data: providerDataPayload,
          });
          console.log(`✅ Created provider: ${created.name} (Primary: ${primaryClinic}, ID: ${created.id})`);
        }
      } catch (error) {
        console.error(`❌ Error processing provider "${fullName}":`, error);
        console.error(`Data payload was:`, JSON.stringify(providerDataPayload, null, 2));
      }
    }
  }

  console.log('✅ Provider seeding process based on CSV data completed.');
  console.log('ℹ️ Note: Further provider management may occur through other system processes.');

  console.log('⚙️ Applying service_role permissions...');

  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO service_role;`);
  console.log('Granted USAGE ON SCHEMA public TO service_role.');

  const tablesToGrantPermissions = [
    "clinics", "users", "providers", "metric_definitions", 
    "data_sources", "column_mappings", "metric_values", "goals",
    "dashboards", "widgets", "user_clinic_roles", "goal_templates",
    "financial_metrics", "appointment_metrics", "call_metrics",
    "patient_metrics", "metric_aggregations", "google_credentials",
    "spreadsheet_connections", "column_mappings_v2",
    "hygiene_production", "dentist_production", "id_mappings",
    "locations", "location_financial", "provider_locations"
  ];

  for (const table of tablesToGrantPermissions) {
    try {
      await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."${table}" TO service_role;`);
      console.log(`Granted CRUD permissions on public."${table}" to service_role.`);
    } catch (error) {
      console.error(`Failed to grant permissions on table public."${table}":`, error);
    }
  }
  
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
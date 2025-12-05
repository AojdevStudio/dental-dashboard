import { PrismaClient } from '@prisma/client';
import winston from 'winston';

const prisma = new PrismaClient();

// Create logger for seeding operations
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// CRITICAL SAFETY CHECK: Prevent accidental test data seeding in production
function validateSeedEnvironment() {
  const dbUrl = process.env.DATABASE_URL;
  
  logger.info('Validating seed environment', {
    databaseUrl: dbUrl?.substring(0, 50) + '...'
  });
  
  // This seed file contains PRODUCTION data for KamDental clinics
  // It should ONLY run against production or development databases
  // It should NEVER run against test databases with fake data
  
  if (dbUrl?.includes('localhost:54322')) {
    throw new Error('❌ Production seed file should not run against local test database (localhost:54322)!');
  }
  
  logger.info('Seed environment validation passed');
}

async function main() {
  // Validate environment before seeding
  validateSeedEnvironment();
  
  logger.info('Starting KamDental production data seeding');
  
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
      },
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
      },
    }),
  ]);

  // Create locations for each clinic (idempotent)
  const _locations = await Promise.all([
    // Humble locations
    prisma.location.upsert({
      where: {
        clinicId_name: {
          clinicId: clinics[0].id,
          name: 'Humble',
        },
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
      },
    }),
    // Baytown locations
    prisma.location.upsert({
      where: {
        clinicId_name: {
          clinicId: clinics[1].id,
          name: 'Baytown',
        },
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
      },
    }),
  ]);

  // Upsert system admin user (idempotent)
  const _adminUser = await prisma.user.upsert({
    where: { email: 'admin@kamdental.com' },
    update: {
      name: 'KamDental System Admin',
      role: 'system_admin',
    },
    create: {
      email: 'admin@kamdental.com',
      name: 'KamDental System Admin',
      role: 'system_admin',
      authId: 'e48f8f72-542f-4d1d-9674-6b59d5855996',
    },
  });

  // Provider data derived from "Provider table - Sheet1 (1).csv"
  // Fixed to create one provider per person with primary clinic assignment
  const providersFromCSV = [
    {
      firstName: 'Kamdi',
      lastName: 'Irondi',
      email: 'k.irondi@kamdental.com',
      providerType: 'dentist',
      primaryClinic: 'Humble',
    }, // Primary at Humble, works at both
    {
      firstName: 'Chinyere',
      lastName: 'Enih',
      email: 'cc.enihdds@gmail.com',
      providerType: 'dentist',
      primaryClinic: 'Humble',
    },
    {
      firstName: 'Obinna',
      lastName: 'Ezeji',
      email: 'obinna.ezeji.dds@gmail.com',
      providerType: 'dentist',
      primaryClinic: 'Baytown',
    },
    {
      firstName: 'Adriane',
      lastName: 'Fontenot',
      email: 'adrianesmile@gmail.com',
      providerType: 'hygienist',
      primaryClinic: 'Baytown',
    },
    {
      firstName: 'Kia',
      lastName: 'Redfearn',
      email: null,
      providerType: 'hygienist',
      primaryClinic: 'Humble',
    },
  ];

  const humbleClinic = clinics.find((c) => c.name === 'KamDental Humble');
  const baytownClinic = clinics.find((c) => c.name === 'KamDental Baytown');

  if (humbleClinic && baytownClinic) {
    for (const providerCsvData of providersFromCSV) {
      const { firstName, lastName, email, providerType, primaryClinic } = providerCsvData;
      const fullName = `${firstName} ${lastName}`;

      // Determine primary clinic ID
      let primaryClinicId: string | undefined;
      if (primaryClinic === 'Humble') {
        primaryClinicId = humbleClinic.id;
      } else if (primaryClinic === 'Baytown') {
        primaryClinicId = baytownClinic.id;
      } else {
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
          const _updated = await prisma.provider.update({
            where: { id: existingProvider.id },
            data: {
              name: fullName,
              email: email,
              clinicId: primaryClinicId, // Update primary clinic if needed
            },
          });
        } else {
          // Provider does not exist, create them
          const _created = await prisma.provider.create({
            data: providerDataPayload,
          });
        }
      } catch (_error) {}
    }
  } else {
    logger.warn('Unable to find clinics - skipping provider creation');
  }

  // Create provider-location relationships
  logger.info('Creating provider-location relationships');
  
  const locationMappings = [
    // Kamdi Irondi - works at both locations (primary: Humble)
    { providerEmail: 'k.irondi@kamdental.com', locationName: 'Humble', isPrimary: true },
    { providerEmail: 'k.irondi@kamdental.com', locationName: 'Baytown', isPrimary: false },
    
    // Chinyere Enih - works at Humble only
    { providerEmail: 'cc.enihdds@gmail.com', locationName: 'Humble', isPrimary: true },
    
    // Obinna Ezeji - works at Baytown only  
    { providerEmail: 'obinna.ezeji.dds@gmail.com', locationName: 'Baytown', isPrimary: true },
    
    // Adriane Fontenot - works at Baytown only
    { providerEmail: 'adrianesmile@gmail.com', locationName: 'Baytown', isPrimary: true },
    
    // Kia Redfearn - works at Humble only (no email, use name match)
    { providerFirstName: 'Kia', providerLastName: 'Redfearn', locationName: 'Humble', isPrimary: true },
  ];

  for (const mapping of locationMappings) {
    try {
      // Find provider by email or name
      let provider;
      if (mapping.providerEmail) {
        provider = await prisma.provider.findUnique({
          where: { email: mapping.providerEmail }
        });
      } else if (mapping.providerFirstName && mapping.providerLastName) {
        provider = await prisma.provider.findFirst({
          where: {
            firstName: mapping.providerFirstName,
            lastName: mapping.providerLastName
          }
        });
      }

      if (!provider) {
        logger.warn('Provider not found for mapping', {
          providerEmail: mapping.providerEmail,
          providerName: `${mapping.providerFirstName} ${mapping.providerLastName}`,
          locationName: mapping.locationName
        });
        continue;
      }

      // Find location by name and clinic
      const location = await prisma.location.findFirst({
        where: {
          name: mapping.locationName,
          clinic: {
            name: mapping.locationName === 'Humble' ? 'KamDental Humble' : 'KamDental Baytown'
          }
        }
      });

      if (!location) {
        logger.warn('Location not found', {
          locationName: mapping.locationName,
          providerName: provider.name
        });
        continue;
      }

      // Create or update provider-location relationship
      await prisma.providerLocation.upsert({
        where: {
          providerId_locationId: {
            providerId: provider.id,
            locationId: location.id
          }
        },
        update: {
          isActive: true,
          isPrimary: mapping.isPrimary,
          startDate: new Date('2024-01-01'), // Default start date
        },
        create: {
          providerId: provider.id,
          locationId: location.id,
          isActive: true,
          isPrimary: mapping.isPrimary,
          startDate: new Date('2024-01-01'), // Default start date
        }
      });

      logger.info('Created/updated provider-location relationship', {
        providerName: provider.name,
        locationName: mapping.locationName,
        isPrimary: mapping.isPrimary
      });
    } catch (error) {
      logger.error('Failed to create provider-location mapping', {
        error: error instanceof Error ? error.message : String(error),
        providerName: `${mapping.providerFirstName} ${mapping.providerLastName}`,
        locationName: mapping.locationName
      });
    }
  }

  logger.info('Provider-location relationships completed');

  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO service_role;');

  const tablesToGrantPermissions = [
    'clinics',
    'users',
    'providers',
    'metric_definitions',
    'data_sources',
    'column_mappings',
    'metric_values',
    'goals',
    'dashboards',
    'widgets',
    'user_clinic_roles',
    'goal_templates',
    'financial_metrics',
    'appointment_metrics',
    'call_metrics',
    'patient_metrics',
    'metric_aggregations',
    'google_credentials',
    'spreadsheet_connections',
    'column_mappings_v2',
    'hygiene_production',
    'dentist_production',
    'id_mappings',
    'locations',
    'location_financial',
    'provider_locations',
  ];

  for (const table of tablesToGrantPermissions) {
    try {
      await prisma.$executeRawUnsafe(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."${table}" TO service_role;`
      );
    } catch (_error) {}
  }

  try {
    await prisma.$executeRawUnsafe(
      'GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;'
    );
  } catch (_error) {}
}

main()
  .catch((_e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

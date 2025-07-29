import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMultiTenantTables() {
  try {
    const _userClinicRole = await prisma.userClinicRole.create({
      data: {
        userId: 'test-user-id',
        clinicId: 'test-clinic-id',
        role: 'clinic_admin',
        isActive: true,
        createdBy: 'system',
      },
    });
    const _goalTemplate = await prisma.goalTemplate.create({
      data: {
        name: 'Monthly Production Goal',
        description: 'Increase production by 10% month-over-month',
        category: 'financial',
        metricDefinitionId: 'test-metric-def-id',
        targetFormula: 'previous_month * 1.1',
        timePeriod: 'monthly',
        isSystemTemplate: true,
      },
    });
    const _financialMetric = await prisma.financialMetric.create({
      data: {
        clinicId: 'test-clinic-id',
        date: new Date(),
        metricType: 'production',
        category: 'procedure_type',
        amount: 1500.0,
        providerId: 'test-provider-id',
        procedureCode: 'D0150',
        notes: 'Comprehensive oral evaluation',
      },
    });
    const _appointmentMetric = await prisma.appointmentMetric.create({
      data: {
        clinicId: 'test-clinic-id',
        date: new Date(),
        providerId: 'test-provider-id',
        appointmentType: 'new_patient',
        scheduledCount: 10,
        completedCount: 8,
        cancelledCount: 1,
        noShowCount: 1,
        averageDuration: 45,
        productionAmount: 3200.0,
        utilizationRate: 85.5,
      },
    });
    const _callMetric = await prisma.callMetric.create({
      data: {
        clinicId: 'test-clinic-id',
        date: new Date(),
        callType: 'hygiene_recall',
        totalCalls: 50,
        connectedCalls: 35,
        voicemails: 15,
        appointmentsScheduled: 20,
        conversionRate: 57.14,
        averageCallDuration: 180,
        staffMemberId: 'test-staff-id',
      },
    });
    const _patientMetric = await prisma.patientMetric.create({
      data: {
        clinicId: 'test-clinic-id',
        date: new Date(),
        activePatients: 1500,
        newPatients: 25,
        reactivatedPatients: 10,
        lostPatients: 5,
        patientRetentionRate: 96.5,
        averagePatientValue: 850.0,
        recareComplianceRate: 75.0,
        treatmentAcceptanceRate: 65.0,
      },
    });
    const _metricAggregation = await prisma.metricAggregation.create({
      data: {
        clinicId: 'test-clinic-id',
        metricDefinitionId: 'test-metric-def-id',
        aggregationType: 'monthly',
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-01-31'),
        value: 125000.0,
        count: 31,
        minimum: 2500.0,
        maximum: 8500.0,
        average: 4032.26,
        standardDeviation: 1250.5,
        metadata: {
          calculation_method: 'sum',
          data_points_excluded: 0,
        },
      },
    });
    const googleCredential = await prisma.googleCredential.create({
      data: {
        clinicId: 'test-clinic-id',
        userId: 'test-user-id',
        accessToken: 'encrypted_access_token_here',
        refreshToken: 'encrypted_refresh_token_here',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      },
    });
    const spreadsheetConnection = await prisma.spreadsheetConnection.create({
      data: {
        clinicId: 'test-clinic-id',
        credentialId: googleCredential.id,
        spreadsheetId: '1234567890abcdef',
        spreadsheetName: 'Production Tracking 2025',
        sheetNames: ['January', 'February', 'March'],
        syncStatus: 'active',
      },
    });
    const _columnMapping = await prisma.columnMappingV2.create({
      data: {
        connectionId: spreadsheetConnection.id,
        sheetName: 'January',
        mappingConfig: {
          mappings: [
            {
              source_column: 'Provider',
              target_field: 'provider_id',
              transform: 'lookup',
            },
            {
              source_column: 'Production',
              target_field: 'amount',
              transform: 'currency',
            },
          ],
        },
        templateName: 'standard_production',
        version: 1,
        isActive: true,
      },
    });
    await prisma.columnMappingV2.deleteMany({});
    await prisma.spreadsheetConnection.deleteMany({});
    await prisma.googleCredential.deleteMany({});
    await prisma.metricAggregation.deleteMany({});
    await prisma.patientMetric.deleteMany({});
    await prisma.callMetric.deleteMany({});
    await prisma.appointmentMetric.deleteMany({});
    await prisma.financialMetric.deleteMany({});
    await prisma.goalTemplate.deleteMany({});
    await prisma.userClinicRole.deleteMany({});
  } catch (_error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testMultiTenantTables().catch(console.error);

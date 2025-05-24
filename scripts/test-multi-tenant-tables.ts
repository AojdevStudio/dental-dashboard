import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testMultiTenantTables() {
  console.log('Testing multi-tenant tables...\n');

  try {
    // Test 1: Create a user-clinic role
    console.log('1. Testing UserClinicRole creation...');
    const userClinicRole = await prisma.userClinicRole.create({
      data: {
        userId: 'test-user-id',
        clinicId: 'test-clinic-id',
        role: 'clinic_admin',
        isActive: true,
        createdBy: 'system',
      },
    });
    console.log('✓ UserClinicRole created:', userClinicRole.id);

    // Test 2: Create a goal template
    console.log('\n2. Testing GoalTemplate creation...');
    const goalTemplate = await prisma.goalTemplate.create({
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
    console.log('✓ GoalTemplate created:', goalTemplate.id);

    // Test 3: Create a financial metric
    console.log('\n3. Testing FinancialMetric creation...');
    const financialMetric = await prisma.financialMetric.create({
      data: {
        clinicId: 'test-clinic-id',
        date: new Date(),
        metricType: 'production',
        category: 'procedure_type',
        amount: 1500.00,
        providerId: 'test-provider-id',
        procedureCode: 'D0150',
        notes: 'Comprehensive oral evaluation',
      },
    });
    console.log('✓ FinancialMetric created:', financialMetric.id);

    // Test 4: Create appointment metrics
    console.log('\n4. Testing AppointmentMetric creation...');
    const appointmentMetric = await prisma.appointmentMetric.create({
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
        productionAmount: 3200.00,
        utilizationRate: 85.5,
      },
    });
    console.log('✓ AppointmentMetric created:', appointmentMetric.id);

    // Test 5: Create call metrics
    console.log('\n5. Testing CallMetric creation...');
    const callMetric = await prisma.callMetric.create({
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
    console.log('✓ CallMetric created:', callMetric.id);

    // Test 6: Create patient metrics
    console.log('\n6. Testing PatientMetric creation...');
    const patientMetric = await prisma.patientMetric.create({
      data: {
        clinicId: 'test-clinic-id',
        date: new Date(),
        activePatients: 1500,
        newPatients: 25,
        reactivatedPatients: 10,
        lostPatients: 5,
        patientRetentionRate: 96.5,
        averagePatientValue: 850.00,
        recareComplianceRate: 75.0,
        treatmentAcceptanceRate: 65.0,
      },
    });
    console.log('✓ PatientMetric created:', patientMetric.id);

    // Test 7: Create metric aggregation
    console.log('\n7. Testing MetricAggregation creation...');
    const metricAggregation = await prisma.metricAggregation.create({
      data: {
        clinicId: 'test-clinic-id',
        metricDefinitionId: 'test-metric-def-id',
        aggregationType: 'monthly',
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-01-31'),
        value: 125000.00,
        count: 31,
        minimum: 2500.00,
        maximum: 8500.00,
        average: 4032.26,
        standardDeviation: 1250.50,
        metadata: {
          calculation_method: 'sum',
          data_points_excluded: 0,
        },
      },
    });
    console.log('✓ MetricAggregation created:', metricAggregation.id);

    // Test 8: Create Google credentials
    console.log('\n8. Testing GoogleCredential creation...');
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
    console.log('✓ GoogleCredential created:', googleCredential.id);

    // Test 9: Create spreadsheet connection
    console.log('\n9. Testing SpreadsheetConnection creation...');
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
    console.log('✓ SpreadsheetConnection created:', spreadsheetConnection.id);

    // Test 10: Create column mapping
    console.log('\n10. Testing ColumnMappingV2 creation...');
    const columnMapping = await prisma.columnMappingV2.create({
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
    console.log('✓ ColumnMappingV2 created:', columnMapping.id);

    console.log('\n✅ All tests passed! New tables are working correctly.');

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
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
    console.log('✓ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testMultiTenantTables().catch(console.error);
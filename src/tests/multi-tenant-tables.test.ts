import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

describe("Multi-Tenant Tables", () => {
  afterAll(async () => {
    // Cleanup test data
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
    await prisma.$disconnect();
  });

  it("should create a UserClinicRole", async () => {
    const userClinicRole = await prisma.userClinicRole.create({
      data: {
        userId: "test-user-id",
        clinicId: "test-clinic-id",
        role: "clinic_admin",
        isActive: true,
        createdBy: "system",
      },
    });

    expect(userClinicRole).toBeDefined();
    expect(userClinicRole.role).toBe("clinic_admin");
  });

  it("should create a GoalTemplate", async () => {
    const goalTemplate = await prisma.goalTemplate.create({
      data: {
        name: "Monthly Production Goal",
        description: "Increase production by 10% month-over-month",
        category: "financial",
        metricDefinitionId: "test-metric-def-id",
        targetFormula: "previous_month * 1.1",
        timePeriod: "monthly",
        isSystemTemplate: true,
      },
    });

    expect(goalTemplate).toBeDefined();
    expect(goalTemplate.name).toBe("Monthly Production Goal");
  });

  it("should create a FinancialMetric", async () => {
    const financialMetric = await prisma.financialMetric.create({
      data: {
        clinicId: "test-clinic-id",
        date: new Date(),
        metricType: "production",
        category: "procedure_type",
        amount: 1500.0,
        providerId: "test-provider-id",
        procedureCode: "D0150",
        notes: "Comprehensive oral evaluation",
      },
    });

    expect(financialMetric).toBeDefined();
    expect(financialMetric.amount.toString()).toBe("1500");
  });

  it("should create appointment, call, and patient metrics", async () => {
    const appointmentMetric = await prisma.appointmentMetric.create({
      data: {
        clinicId: "test-clinic-id",
        date: new Date(),
        providerId: "test-provider-id",
        appointmentType: "new_patient",
        scheduledCount: 10,
        completedCount: 8,
        cancelledCount: 1,
        noShowCount: 1,
        averageDuration: 45,
        productionAmount: 3200.0,
        utilizationRate: 85.5,
      },
    });

    const callMetric = await prisma.callMetric.create({
      data: {
        clinicId: "test-clinic-id",
        date: new Date(),
        callType: "hygiene_recall",
        totalCalls: 50,
        connectedCalls: 35,
        voicemails: 15,
        appointmentsScheduled: 20,
        conversionRate: 57.14,
        averageCallDuration: 180,
        staffMemberId: "test-staff-id",
      },
    });

    const patientMetric = await prisma.patientMetric.create({
      data: {
        clinicId: "test-clinic-id",
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

    expect(appointmentMetric.scheduledCount).toBe(10);
    expect(callMetric.totalCalls).toBe(50);
    expect(patientMetric.activePatients).toBe(1500);
  });

  it("should create Google integration tables", async () => {
    const googleCredential = await prisma.googleCredential.create({
      data: {
        clinicId: "test-clinic-id",
        userId: "test-user-id",
        accessToken: "encrypted_access_token_here",
        refreshToken: "encrypted_refresh_token_here",
        expiresAt: new Date(Date.now() + 3600000),
        scope: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      },
    });

    const spreadsheetConnection = await prisma.spreadsheetConnection.create({
      data: {
        clinicId: "test-clinic-id",
        credentialId: googleCredential.id,
        spreadsheetId: "1234567890abcdef",
        spreadsheetName: "Production Tracking 2025",
        sheetNames: ["January", "February", "March"],
        syncStatus: "active",
      },
    });

    const columnMapping = await prisma.columnMappingV2.create({
      data: {
        connectionId: spreadsheetConnection.id,
        sheetName: "January",
        mappingConfig: {
          mappings: [
            {
              source_column: "Provider",
              target_field: "provider_id",
              transform: "lookup",
            },
            {
              source_column: "Production",
              target_field: "amount",
              transform: "currency",
            },
          ],
        },
        templateName: "standard_production",
        version: 1,
        isActive: true,
      },
    });

    expect(googleCredential.scope).toContain(
      "https://www.googleapis.com/auth/spreadsheets.readonly"
    );
    expect(spreadsheetConnection.syncStatus).toBe("active");
    expect(columnMapping.isActive).toBe(true);
  });
});

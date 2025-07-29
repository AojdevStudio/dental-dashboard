/**
 * Data Migration Validation Script
 * Validates data integrity after migration
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  table: string;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
  }>;
}

interface ValidationReport {
  timestamp: Date;
  overallStatus: 'passed' | 'failed' | 'warning';
  results: ValidationResult[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

class MigrationValidator {
  private results: ValidationResult[] = [];
  private report: ValidationReport;

  constructor() {
    this.report = {
      timestamp: new Date(),
      overallStatus: 'passed',
      results: [],
      summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  private addCheck(
    table: string,
    name: string,
    passed: boolean,
    message: string,
    details?: Record<string, unknown>
  ) {
    let tableResult = this.results.find((r) => r.table === table);
    if (!tableResult) {
      tableResult = { table, checks: [] };
      this.results.push(tableResult);
    }

    tableResult.checks.push({ name, passed, message, details });

    this.report.summary.totalChecks++;
    if (passed) {
      this.report.summary.passed++;
    } else {
      this.report.summary.failed++;
      this.report.overallStatus = 'failed';
    }
  }

  async validateUsers() {
    const table = 'users';

    // Check 1: All users have UUIDs
    const totalUsers = await prisma.user.count();
    const usersWithUuid = await prisma.user.count({
      where: { uuidId: { not: null } },
    });

    this.addCheck(
      table,
      'UUID Population',
      totalUsers === usersWithUuid,
      `${usersWithUuid}/${totalUsers} users have UUIDs`,
      { missing: totalUsers - usersWithUuid }
    );

    // Check 2: All users have unique UUIDs
    const users = await prisma.user.findMany({
      where: { uuidId: { not: null } },
      select: { id: true, uuidId: true },
    });

    const uuidSet = new Set(users.map((u) => u.uuidId));
    const hasUniqueUuids = uuidSet.size === users.length;

    this.addCheck(
      table,
      'UUID Uniqueness',
      hasUniqueUuids,
      hasUniqueUuids ? 'All UUIDs are unique' : 'Duplicate UUIDs found',
      { duplicates: users.length - uuidSet.size }
    );

    // Check 3: ID mappings exist for all users
    const userMappings = await prisma.idMapping.count({
      where: { tableName: 'users' },
    });

    this.addCheck(
      table,
      'ID Mappings',
      userMappings === totalUsers,
      `${userMappings}/${totalUsers} users have ID mappings`,
      { missing: totalUsers - userMappings }
    );

    // Check 4: All users belong to valid clinics
    const usersWithInvalidClinic = await prisma.user.findMany({
      where: {
        clinic: {
          is: undefined,
        },
      },
      select: { id: true, email: true },
    });

    this.addCheck(
      table,
      'Clinic References',
      usersWithInvalidClinic.length === 0,
      usersWithInvalidClinic.length === 0
        ? 'All users have valid clinic references'
        : `${usersWithInvalidClinic.length} users have invalid clinic references`,
      { invalidUsers: usersWithInvalidClinic }
    );

    // Check 5: User-clinic role mappings
    const usersWithoutRoles = await prisma.$queryRaw<Array<{ id: string; email: string }>>`
      SELECT u.id, u.email
      FROM users u
      LEFT JOIN user_clinic_roles ucr ON u.id = ucr.user_id
      WHERE ucr.id IS NULL
    `;

    this.addCheck(
      table,
      'Role Assignments',
      usersWithoutRoles.length === 0,
      usersWithoutRoles.length === 0
        ? 'All users have role assignments'
        : `${usersWithoutRoles.length} users without role assignments`,
      { usersWithoutRoles }
    );
  }

  async validateClinics() {
    const table = 'clinics';

    // Check 1: All clinics have UUIDs
    const totalClinics = await prisma.clinic.count();
    const clinicsWithUuid = await prisma.clinic.count({
      where: { uuidId: { not: null } },
    });

    this.addCheck(
      table,
      'UUID Population',
      totalClinics === clinicsWithUuid,
      `${clinicsWithUuid}/${totalClinics} clinics have UUIDs`,
      { missing: totalClinics - clinicsWithUuid }
    );

    // Check 2: ID mappings exist
    const clinicMappings = await prisma.idMapping.count({
      where: { tableName: 'clinics' },
    });

    this.addCheck(
      table,
      'ID Mappings',
      clinicMappings === totalClinics,
      `${clinicMappings}/${totalClinics} clinics have ID mappings`,
      { missing: totalClinics - clinicMappings }
    );

    // Check 3: Clinics have associated data
    const clinicsWithData = await prisma.clinic.findMany({
      include: {
        _count: {
          select: {
            users: true,
            providers: true,
            metrics: true,
            goals: true,
          },
        },
      },
    });

    const emptyClinics = clinicsWithData.filter(
      (c) =>
        c._count.users === 0 &&
        c._count.providers === 0 &&
        c._count.metrics === 0 &&
        c._count.goals === 0
    );

    this.addCheck(
      table,
      'Data Association',
      emptyClinics.length === 0,
      emptyClinics.length === 0
        ? 'All clinics have associated data'
        : `${emptyClinics.length} clinics have no associated data`,
      { emptyClinics: emptyClinics.map((c) => ({ id: c.id, name: c.name })) }
    );
  }

  async validateRelationships() {
    const table = 'relationships';

    // Check 1: Provider-Clinic relationships
    const orphanedProviders = await prisma.provider.findMany({
      where: {
        clinic: {
          is: undefined,
        },
      },
      select: { id: true, name: true },
    });

    this.addCheck(
      table,
      'Provider-Clinic',
      orphanedProviders.length === 0,
      orphanedProviders.length === 0
        ? 'All providers have valid clinic references'
        : `${orphanedProviders.length} orphaned providers found`,
      { orphanedProviders }
    );

    // Check 2: MetricValue relationships
    const orphanedMetrics = await prisma.metricValue.findMany({
      where: {
        AND: [
          { clinicId: { not: null } },
          {
            clinic: {
              is: null,
            },
          },
        ],
      },
      select: { id: true },
      take: 10,
    });

    const orphanedMetricCount = await prisma.metricValue.count({
      where: {
        AND: [
          { clinicId: { not: null } },
          {
            clinic: {
              is: null,
            },
          },
        ],
      },
    });

    this.addCheck(
      table,
      'MetricValue-Clinic',
      orphanedMetricCount === 0,
      orphanedMetricCount === 0
        ? 'All metric values have valid clinic references'
        : `${orphanedMetricCount} orphaned metric values found`,
      { count: orphanedMetricCount, sample: orphanedMetrics }
    );

    // Check 3: Dashboard-User relationships
    const dashboardsWithInvalidUser = await prisma.dashboard.findMany({
      where: {
        user: {
          is: undefined,
        },
      },
      select: { id: true, name: true },
    });

    this.addCheck(
      table,
      'Dashboard-User',
      dashboardsWithInvalidUser.length === 0,
      dashboardsWithInvalidUser.length === 0
        ? 'All dashboards have valid user references'
        : `${dashboardsWithInvalidUser.length} dashboards with invalid user references`,
      { dashboardsWithInvalidUser }
    );

    // Check 4: Widget-Dashboard relationships
    const orphanedWidgets = await prisma.widget.count({
      where: {
        dashboard: {
          is: undefined,
        },
      },
    });

    this.addCheck(
      table,
      'Widget-Dashboard',
      orphanedWidgets === 0,
      orphanedWidgets === 0
        ? 'All widgets have valid dashboard references'
        : `${orphanedWidgets} orphaned widgets found`
    );
  }

  async validateDataIntegrity() {
    const table = 'data_integrity';

    // Check 1: Consistent timestamps
    const futureTimestamps = await prisma.$queryRaw<Array<{ table_name: string; count: bigint }>>`
      SELECT 'users' as table_name, COUNT(*) as count FROM users WHERE created_at > NOW()
      UNION ALL
      SELECT 'clinics' as table_name, COUNT(*) as count FROM clinics WHERE created_at > NOW()
      UNION ALL
      SELECT 'providers' as table_name, COUNT(*) as count FROM providers WHERE created_at > NOW()
    `;

    const hasFutureTimestamps = futureTimestamps.some((r) => Number(r.count) > 0);

    this.addCheck(
      table,
      'Timestamp Validity',
      !hasFutureTimestamps,
      hasFutureTimestamps ? 'Found records with future timestamps' : 'All timestamps are valid',
      { futureTimestamps: futureTimestamps.filter((r) => Number(r.count) > 0) }
    );

    // Check 2: Required fields populated
    const usersWithMissingData = await prisma.user.count({
      where: {
        OR: [{ email: null }, { name: null }, { role: null }],
      },
    });

    this.addCheck(
      table,
      'Required Fields',
      usersWithMissingData === 0,
      usersWithMissingData === 0
        ? 'All required fields are populated'
        : `${usersWithMissingData} users with missing required fields`
    );

    // Check 3: Enum values are valid
    const invalidRoles = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role NOT IN ('office_manager', 'dentist', 'front_desk', 'admin')
    `;

    const hasInvalidRoles = Number(invalidRoles[0].count) > 0;

    this.addCheck(
      table,
      'Enum Validation',
      !hasInvalidRoles,
      hasInvalidRoles
        ? `${invalidRoles[0].count} users with invalid roles`
        : 'All enum values are valid'
    );
  }

  async validatePerformance() {
    const table = 'performance';

    // Check 1: Index usage
    const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string }>>`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
    `;

    const expectedIndexes = [
      'idx_user_clinic_roles_user_auth',
      'idx_user_clinic_roles_clinic_active',
      'idx_users_auth_id',
      'idx_data_sources_clinic',
      'idx_providers_clinic',
    ];

    const foundIndexes = indexes.map((i) => i.indexname);
    const missingIndexes = expectedIndexes.filter((idx) => !foundIndexes.includes(idx));

    this.addCheck(
      table,
      'Required Indexes',
      missingIndexes.length === 0,
      missingIndexes.length === 0
        ? 'All required indexes are present'
        : `${missingIndexes.length} required indexes are missing`,
      { missingIndexes }
    );

    // Check 2: Table sizes
    const tableSizes = await prisma.$queryRaw<
      Array<{
        tablename: string;
        row_count: bigint;
        total_size: string;
      }>
    >`
      SELECT 
        c.relname AS tablename,
        c.reltuples::BIGINT AS row_count,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
      AND n.nspname = 'public'
      ORDER BY pg_total_relation_size(c.oid) DESC
    `;

    this.addCheck(
      table,
      'Table Sizes',
      true, // Informational check
      'Table size information collected',
      { tableSizes: tableSizes.slice(0, 10) } // Top 10 tables
    );
  }

  async generateReport() {
    this.report.results = this.results;

    const reportDir = path.join(process.cwd(), 'migration-logs');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(
      reportDir,
      `validation-report-${this.report.timestamp.toISOString().replace(/[:.]/g, '-')}.json`
    );

    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));

    if (this.report.summary.failed > 0) {
      this.results.forEach((result) => {
        const failedChecks = result.checks.filter((c) => !c.passed);
        if (failedChecks.length > 0) {
          failedChecks.forEach((check) => {
            if (check.details) {
            }
          });
        }
      });
    }
  }

  async run() {
    try {
      await this.validateUsers();
      await this.validateClinics();
      await this.validateRelationships();
      await this.validateDataIntegrity();
      await this.validatePerformance();

      await this.generateReport();
    } catch (error) {
      this.report.overallStatus = 'failed';
      await this.generateReport();
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Run validator if called directly
if (require.main === module) {
  const validator = new MigrationValidator();
  validator.run().catch((_error) => {
    process.exit(1);
  });
}

export { MigrationValidator };

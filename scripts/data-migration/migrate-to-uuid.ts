/**
 * Data Migration Script - Phase 4
 * Migrates existing data to UUID-based multi-tenant structure
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Migration configuration
const BATCH_SIZE = 1000;
const MIGRATION_LOG_DIR = path.join(process.cwd(), 'migration-logs');
const CHECKPOINT_FILE = path.join(MIGRATION_LOG_DIR, 'migration-checkpoint.json');

interface MigrationCheckpoint {
  phase: string;
  table: string;
  lastProcessedId: string | null;
  processedCount: number;
  totalCount: number;
  startedAt: string;
  updatedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errors: Array<{ id: string; error: string; timestamp: string }>;
}

interface MigrationReport {
  startedAt: Date;
  completedAt?: Date;
  status: 'success' | 'failed' | 'partial';
  tables: {
    [key: string]: {
      total: number;
      migrated: number;
      failed: number;
      duration: number;
    };
  };
  errors: Array<{ table: string; id: string; error: string }>;
}

class DataMigration {
  private report: MigrationReport;
  private checkpoints: Map<string, MigrationCheckpoint>;

  constructor() {
    this.report = {
      startedAt: new Date(),
      status: 'success',
      tables: {},
      errors: [],
    };
    this.checkpoints = new Map();
  }

  async initialize() {
    // Create migration log directory
    await fs.mkdir(MIGRATION_LOG_DIR, { recursive: true });

    // Load existing checkpoints if any
    try {
      const checkpointData = await fs.readFile(CHECKPOINT_FILE, 'utf-8');
      const checkpoints = JSON.parse(checkpointData);
      checkpoints.forEach((cp: MigrationCheckpoint) => {
        this.checkpoints.set(`${cp.table}`, cp);
      });
    } catch (_error) {}
  }

  async saveCheckpoint(table: string, checkpoint: MigrationCheckpoint) {
    this.checkpoints.set(table, checkpoint);
    const checkpointArray = Array.from(this.checkpoints.values());
    await fs.writeFile(CHECKPOINT_FILE, JSON.stringify(checkpointArray, null, 2));
  }

  async migrateUsers() {
    const startTime = Date.now();
    const table = 'users';

    try {
      // Get total count
      const totalCount = await prisma.user.count();
      if (totalCount === 0) {
        return;
      }

      // Get or create checkpoint
      const checkpoint = this.checkpoints.get(table) || {
        phase: 'uuid_migration',
        table,
        lastProcessedId: null,
        processedCount: 0,
        totalCount,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'in_progress' as const,
        errors: [],
      };

      // Process in batches
      let hasMore = true;
      let _processedInSession = 0;

      while (hasMore) {
        const users = await prisma.user.findMany({
          where: {
            AND: [
              checkpoint.lastProcessedId ? { id: { gt: checkpoint.lastProcessedId } } : {},
              { uuidId: null }, // Only process users without UUID
            ],
          },
          orderBy: { id: 'asc' },
          take: BATCH_SIZE,
        });

        if (users.length === 0) {
          hasMore = false;
          break;
        }

        // Process batch in transaction
        await prisma.$transaction(async (tx) => {
          for (const user of users) {
            try {
              const uuid = uuidv4();

              // Update user with UUID
              await tx.user.update({
                where: { id: user.id },
                data: { uuidId: uuid },
              });

              // Create ID mapping
              await tx.idMapping.create({
                data: {
                  tableName: 'users',
                  oldId: user.id,
                  newId: uuid,
                },
              });

              _processedInSession++;
              checkpoint.processedCount++;
              checkpoint.lastProcessedId = user.id;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              checkpoint.errors.push({
                id: user.id,
                error: errorMsg,
                timestamp: new Date().toISOString(),
              });
              this.report.errors.push({
                table: 'users',
                id: user.id,
                error: errorMsg,
              });
            }
          }
        });

        // Update checkpoint
        checkpoint.updatedAt = new Date().toISOString();
        await this.saveCheckpoint(table, checkpoint);
      }

      // Mark as completed
      checkpoint.status = 'completed';
      await this.saveCheckpoint(table, checkpoint);

      const duration = Date.now() - startTime;
      this.report.tables[table] = {
        total: totalCount,
        migrated: checkpoint.processedCount,
        failed: checkpoint.errors.length,
        duration,
      };
    } catch (error) {
      this.report.status = 'failed';
      throw error;
    }
  }

  async migrateClinics() {
    const startTime = Date.now();
    const table = 'clinics';

    try {
      const totalCount = await prisma.clinic.count();
      if (totalCount === 0) {
        return;
      }

      const checkpoint = this.checkpoints.get(table) || {
        phase: 'uuid_migration',
        table,
        lastProcessedId: null,
        processedCount: 0,
        totalCount,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'in_progress' as const,
        errors: [],
      };

      let hasMore = true;
      let _processedInSession = 0;

      while (hasMore) {
        const clinics = await prisma.clinic.findMany({
          where: {
            AND: [
              checkpoint.lastProcessedId ? { id: { gt: checkpoint.lastProcessedId } } : {},
              { uuidId: null },
            ],
          },
          orderBy: { id: 'asc' },
          take: BATCH_SIZE,
        });

        if (clinics.length === 0) {
          hasMore = false;
          break;
        }

        await prisma.$transaction(async (tx) => {
          for (const clinic of clinics) {
            try {
              const uuid = uuidv4();

              await tx.clinic.update({
                where: { id: clinic.id },
                data: { uuidId: uuid },
              });

              await tx.idMapping.create({
                data: {
                  tableName: 'clinics',
                  oldId: clinic.id,
                  newId: uuid,
                },
              });

              _processedInSession++;
              checkpoint.processedCount++;
              checkpoint.lastProcessedId = clinic.id;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              checkpoint.errors.push({
                id: clinic.id,
                error: errorMsg,
                timestamp: new Date().toISOString(),
              });
              this.report.errors.push({
                table: 'clinics',
                id: clinic.id,
                error: errorMsg,
              });
            }
          }
        });

        checkpoint.updatedAt = new Date().toISOString();
        await this.saveCheckpoint(table, checkpoint);
      }

      checkpoint.status = 'completed';
      await this.saveCheckpoint(table, checkpoint);

      const duration = Date.now() - startTime;
      this.report.tables[table] = {
        total: totalCount,
        migrated: checkpoint.processedCount,
        failed: checkpoint.errors.length,
        duration,
      };
    } catch (error) {
      this.report.status = 'failed';
      throw error;
    }
  }

  async migrateDashboards() {
    const startTime = Date.now();
    const table = 'dashboards';

    try {
      const totalCount = await prisma.dashboard.count();
      if (totalCount === 0) {
        return;
      }

      const checkpoint = this.checkpoints.get(table) || {
        phase: 'uuid_migration',
        table,
        lastProcessedId: null,
        processedCount: 0,
        totalCount,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'in_progress' as const,
        errors: [],
      };

      let hasMore = true;
      let _processedInSession = 0;

      while (hasMore) {
        const dashboards = await prisma.dashboard.findMany({
          where: {
            AND: [
              checkpoint.lastProcessedId ? { id: { gt: checkpoint.lastProcessedId } } : {},
              { uuidId: null },
            ],
          },
          include: { user: true },
          orderBy: { id: 'asc' },
          take: BATCH_SIZE,
        });

        if (dashboards.length === 0) {
          hasMore = false;
          break;
        }

        await prisma.$transaction(async (tx) => {
          for (const dashboard of dashboards) {
            try {
              const uuid = uuidv4();
              const userUuid = dashboard.user.uuidId;

              if (!userUuid) {
                throw new Error(`User ${dashboard.userId} has no UUID`);
              }

              await tx.dashboard.update({
                where: { id: dashboard.id },
                data: {
                  uuidId: uuid,
                  userUuidId: userUuid,
                },
              });

              await tx.idMapping.create({
                data: {
                  tableName: 'dashboards',
                  oldId: dashboard.id,
                  newId: uuid,
                },
              });

              _processedInSession++;
              checkpoint.processedCount++;
              checkpoint.lastProcessedId = dashboard.id;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              checkpoint.errors.push({
                id: dashboard.id,
                error: errorMsg,
                timestamp: new Date().toISOString(),
              });
              this.report.errors.push({
                table: 'dashboards',
                id: dashboard.id,
                error: errorMsg,
              });
            }
          }
        });

        checkpoint.updatedAt = new Date().toISOString();
        await this.saveCheckpoint(table, checkpoint);
      }

      checkpoint.status = 'completed';
      await this.saveCheckpoint(table, checkpoint);

      const duration = Date.now() - startTime;
      this.report.tables[table] = {
        total: totalCount,
        migrated: checkpoint.processedCount,
        failed: checkpoint.errors.length,
        duration,
      };
    } catch (error) {
      this.report.status = 'failed';
      throw error;
    }
  }

  async validateDataIntegrity() {
    const validationErrors: string[] = [];

    try {
      // Validate user UUID population
      const usersWithoutUuid = await prisma.user.count({
        where: { uuidId: null },
      });
      if (usersWithoutUuid > 0) {
        validationErrors.push(`${usersWithoutUuid} users still without UUID`);
      }

      // Validate clinic UUID population
      const clinicsWithoutUuid = await prisma.clinic.count({
        where: { uuidId: null },
      });
      if (clinicsWithoutUuid > 0) {
        validationErrors.push(`${clinicsWithoutUuid} clinics still without UUID`);
      }

      // Validate dashboard UUID population and user references
      const dashboardsWithoutUuid = await prisma.dashboard.count({
        where: { uuidId: null },
      });
      if (dashboardsWithoutUuid > 0) {
        validationErrors.push(`${dashboardsWithoutUuid} dashboards still without UUID`);
      }

      const dashboardsWithoutUserUuid = await prisma.dashboard.count({
        where: {
          AND: [{ uuidId: { not: null } }, { userUuidId: null }],
        },
      });
      if (dashboardsWithoutUserUuid > 0) {
        validationErrors.push(
          `${dashboardsWithoutUserUuid} dashboards without user UUID reference`
        );
      }

      // Validate ID mappings
      const userMappings = await prisma.idMapping.count({
        where: { tableName: 'users' },
      });
      const totalUsers = await prisma.user.count();
      if (userMappings !== totalUsers) {
        validationErrors.push(
          `ID mapping mismatch for users: ${userMappings} mappings vs ${totalUsers} users`
        );
      }

      // Check for orphaned records
      const orphanedProviders = await prisma.provider.count({
        where: {
          clinic: {
            is: null,
          },
        },
      });
      if (orphanedProviders > 0) {
        validationErrors.push(`${orphanedProviders} providers without valid clinic reference`);
      }

      if (validationErrors.length > 0) {
        // Validation errors found during migration
        this.report.status = 'partial';
      } else {
        this.report.status = 'success';
      }
    } catch (error) {
      this.report.status = 'failed';
      throw error;
    }
  }

  async generateReport() {
    this.report.completedAt = new Date();

    const reportPath = path.join(
      MIGRATION_LOG_DIR,
      `migration-report-${this.report.startedAt.toISOString().replace(/[:.]/g, '-')}.json`
    );

    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));

    Object.entries(this.report.tables).forEach(([_table, _stats]) => {});

    if (this.report.errors.length > 0) {
      this.report.errors.slice(0, 10).forEach((_error) => {});
      if (this.report.errors.length > 10) {
      }
    }
  }

  async run() {
    try {
      await this.initialize();

      // Run migrations in order
      await this.migrateUsers();
      await this.migrateClinics();
      await this.migrateDashboards();

      // Validate data integrity
      await this.validateDataIntegrity();

      // Generate report
      await this.generateReport();
    } catch (error) {
      this.report.status = 'failed';
      await this.generateReport();
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new DataMigration();
  migration.run().catch((_error) => {
    process.exit(1);
  });
}

export { DataMigration };

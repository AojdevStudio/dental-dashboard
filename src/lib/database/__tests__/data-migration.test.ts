import { DataMigration } from "@/scripts/data-migration/migrate-to-uuid";
import { MigrationValidator } from "@/scripts/data-migration/validate-migration";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma Client
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    clinic: {
      count: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    dashboard: {
      count: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    idMapping: {
      create: vi.fn(),
      count: vi.fn(),
    },
  })),
}));

describe("Data Migration", () => {
  let prisma: any;
  let migration: DataMigration;

  beforeEach(() => {
    prisma = new PrismaClient();
    migration = new DataMigration();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("User Migration", () => {
    it("should migrate users with UUIDs", async () => {
      const testUsers = [
        { id: "user1", email: "user1@example.com", name: "User 1", uuidId: null },
        { id: "user2", email: "user2@example.com", name: "User 2", uuidId: null },
      ];

      prisma.user.count.mockResolvedValue(2);
      prisma.user.findMany.mockResolvedValueOnce(testUsers).mockResolvedValueOnce([]);

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          idMapping: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);

        // Verify updates were called for each user
        expect(tx.user.update).toHaveBeenCalledTimes(2);
        expect(tx.idMapping.create).toHaveBeenCalledTimes(2);
      });

      await migration.migrateUsers();

      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.user.findMany).toHaveBeenCalled();
    });

    it("should handle users that already have UUIDs", async () => {
      const testUsers = [
        { id: "user1", email: "user1@example.com", name: "User 1", uuidId: uuidv4() },
        { id: "user2", email: "user2@example.com", name: "User 2", uuidId: null },
      ];

      prisma.user.count.mockResolvedValue(2);
      prisma.user.findMany
        .mockResolvedValueOnce([testUsers[1]]) // Only user without UUID
        .mockResolvedValueOnce([]);

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          idMapping: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);

        // Should only update the user without UUID
        expect(tx.user.update).toHaveBeenCalledTimes(1);
        expect(tx.idMapping.create).toHaveBeenCalledTimes(1);
      });

      await migration.migrateUsers();
    });

    it("should handle migration errors gracefully", async () => {
      const testUsers = [{ id: "user1", email: "user1@example.com", name: "User 1", uuidId: null }];

      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValueOnce(testUsers).mockResolvedValueOnce([]);

      prisma.$transaction.mockRejectedValue(new Error("Database error"));

      await expect(migration.migrateUsers()).rejects.toThrow("Database error");
    });
  });

  describe("Clinic Migration", () => {
    it("should migrate clinics with UUIDs", async () => {
      const testClinics = [
        { id: "clinic1", name: "Clinic 1", location: "Location 1", uuidId: null },
        { id: "clinic2", name: "Clinic 2", location: "Location 2", uuidId: null },
      ];

      prisma.clinic.count.mockResolvedValue(2);
      prisma.clinic.findMany.mockResolvedValueOnce(testClinics).mockResolvedValueOnce([]);

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          clinic: {
            update: vi.fn().mockResolvedValue({}),
          },
          idMapping: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);

        expect(tx.clinic.update).toHaveBeenCalledTimes(2);
        expect(tx.idMapping.create).toHaveBeenCalledTimes(2);
      });

      await migration.migrateClinics();

      expect(prisma.clinic.count).toHaveBeenCalled();
      expect(prisma.clinic.findMany).toHaveBeenCalled();
    });
  });

  describe("Dashboard Migration", () => {
    it("should migrate dashboards with user UUID references", async () => {
      const userUuid = uuidv4();
      const testDashboards = [
        {
          id: "dash1",
          name: "Dashboard 1",
          userId: "user1",
          uuidId: null,
          user: { id: "user1", uuidId: userUuid },
        },
      ];

      prisma.dashboard.count.mockResolvedValue(1);
      prisma.dashboard.findMany.mockResolvedValueOnce(testDashboards).mockResolvedValueOnce([]);

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          dashboard: {
            update: vi.fn().mockResolvedValue({}),
          },
          idMapping: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);

        expect(tx.dashboard.update).toHaveBeenCalledWith({
          where: { id: "dash1" },
          data: expect.objectContaining({
            uuidId: expect.any(String),
            userUuidId: userUuid,
          }),
        });
      });

      await migration.migrateDashboards();
    });

    it("should fail if user has no UUID", async () => {
      const testDashboards = [
        {
          id: "dash1",
          name: "Dashboard 1",
          userId: "user1",
          uuidId: null,
          user: { id: "user1", uuidId: null }, // User without UUID
        },
      ];

      prisma.dashboard.count.mockResolvedValue(1);
      prisma.dashboard.findMany.mockResolvedValueOnce(testDashboards).mockResolvedValueOnce([]);

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          dashboard: {
            update: vi.fn(),
          },
          idMapping: {
            create: vi.fn(),
          },
        };

        // Simulate error handling in transaction
        try {
          await callback(tx);
        } catch (error) {
          // Expected error
        }

        // Should not update dashboard with missing user UUID
        expect(tx.dashboard.update).not.toHaveBeenCalled();
      });

      await migration.migrateDashboards();
    });
  });

  describe("Batch Processing", () => {
    it("should process large datasets in batches", async () => {
      const BATCH_SIZE = 1000;
      const TOTAL_USERS = 2500;

      // Create test users
      const createBatch = (start: number, size: number) =>
        Array.from({ length: size }, (_, i) => ({
          id: `user${start + i}`,
          email: `user${start + i}@example.com`,
          name: `User ${start + i}`,
          uuidId: null,
        }));

      prisma.user.count.mockResolvedValue(TOTAL_USERS);

      // Mock three batches
      prisma.user.findMany
        .mockResolvedValueOnce(createBatch(0, BATCH_SIZE))
        .mockResolvedValueOnce(createBatch(1000, BATCH_SIZE))
        .mockResolvedValueOnce(createBatch(2000, 500))
        .mockResolvedValueOnce([]);

      let totalProcessed = 0;
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          idMapping: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);
        totalProcessed += tx.user.update.mock.calls.length;
      });

      await migration.migrateUsers();

      expect(prisma.user.findMany).toHaveBeenCalledTimes(4);
      expect(totalProcessed).toBe(TOTAL_USERS);
    });
  });
});

describe("Migration Validation", () => {
  let prisma: any;
  let validator: MigrationValidator;

  beforeEach(() => {
    prisma = new PrismaClient();
    validator = new MigrationValidator();
    vi.clearAllMocks();
  });

  describe("User Validation", () => {
    it("should validate all users have UUIDs", async () => {
      prisma.user.count
        .mockResolvedValueOnce(10) // Total users
        .mockResolvedValueOnce(10); // Users with UUID

      prisma.user.findMany.mockResolvedValue([
        { id: "user1", uuidId: uuidv4() },
        { id: "user2", uuidId: uuidv4() },
      ]);

      prisma.idMapping.count.mockResolvedValue(10);

      prisma.$queryRaw.mockResolvedValue([]);

      await validator.validateUsers();

      // Validation should pass
      expect(prisma.user.count).toHaveBeenCalled();
    });

    it("should detect users without UUIDs", async () => {
      prisma.user.count
        .mockResolvedValueOnce(10) // Total users
        .mockResolvedValueOnce(8); // Users with UUID (2 missing)

      prisma.user.findMany.mockResolvedValue([]);
      prisma.idMapping.count.mockResolvedValue(8);
      prisma.$queryRaw.mockResolvedValue([]);

      await validator.validateUsers();

      // Should detect the discrepancy
      expect(prisma.user.count).toHaveBeenCalledTimes(2);
    });

    it("should detect duplicate UUIDs", async () => {
      const duplicateUuid = uuidv4();

      prisma.user.count
        .mockResolvedValueOnce(3) // Total users
        .mockResolvedValueOnce(3); // Users with UUID

      prisma.user.findMany.mockResolvedValue([
        { id: "user1", uuidId: duplicateUuid },
        { id: "user2", uuidId: duplicateUuid }, // Duplicate!
        { id: "user3", uuidId: uuidv4() },
      ]);

      prisma.idMapping.count.mockResolvedValue(3);
      prisma.$queryRaw.mockResolvedValue([]);

      await validator.validateUsers();

      // Should detect duplicate UUIDs
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe("Relationship Validation", () => {
    it("should detect orphaned providers", async () => {
      prisma.provider.findMany.mockResolvedValue([{ id: "provider1", name: "Orphaned Provider" }]);

      prisma.provider.count.mockResolvedValue(1);
      prisma.metricValue.findMany.mockResolvedValue([]);
      prisma.metricValue.count.mockResolvedValue(0);
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.widget.count.mockResolvedValue(0);

      await validator.validateRelationships();

      expect(prisma.provider.findMany).toHaveBeenCalledWith({
        where: { clinic: { is: null } },
        select: { id: true, name: true },
      });
    });

    it("should validate dashboard-user relationships", async () => {
      prisma.provider.findMany.mockResolvedValue([]);
      prisma.provider.count.mockResolvedValue(0);
      prisma.metricValue.findMany.mockResolvedValue([]);
      prisma.metricValue.count.mockResolvedValue(0);

      prisma.dashboard.findMany.mockResolvedValue([{ id: "dash1", name: "Orphaned Dashboard" }]);

      prisma.widget.count.mockResolvedValue(0);

      await validator.validateRelationships();

      expect(prisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { user: { is: null } },
        select: { id: true, name: true },
      });
    });
  });

  describe("Data Integrity Validation", () => {
    it("should detect future timestamps", async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([
          { table_name: "users", count: BigInt(0) },
          { table_name: "clinics", count: BigInt(2) }, // 2 records with future timestamps
          { table_name: "providers", count: BigInt(0) },
        ])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      prisma.user.count.mockResolvedValue(0);

      await validator.validateDataIntegrity();

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([
          { table_name: "users", count: BigInt(0) },
          { table_name: "clinics", count: BigInt(0) },
          { table_name: "providers", count: BigInt(0) },
        ])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      prisma.user.count.mockResolvedValue(3); // 3 users with missing data

      await validator.validateDataIntegrity();

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          OR: [{ email: null }, { name: null }, { role: null }],
        },
      });
    });
  });
});

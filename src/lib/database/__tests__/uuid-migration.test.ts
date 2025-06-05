/**
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

describe("Phase 2: UUID Migration", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Schema Changes Verification", () => {
    it("should have added UUID fields to User table", async () => {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name IN ('auth_id', 'uuid_id')
        ORDER BY column_name
      `;

      expect(columns).toHaveLength(2);
      expect(columns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ column_name: "auth_id", is_nullable: "YES" }),
          expect.objectContaining({ column_name: "uuid_id", is_nullable: "YES" }),
        ])
      );
    });

    it("should have added UUID field to Clinic table", async () => {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'clinics'
        AND column_name = 'uuid_id'
      `;

      expect(columns).toHaveLength(1);
      expect(columns[0]).toMatchObject({
        column_name: "uuid_id",
        is_nullable: "YES",
      });
    });

    it("should have added UUID fields to Dashboard table", async () => {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'dashboards'
        AND column_name IN ('uuid_id', 'user_uuid_id')
        ORDER BY column_name
      `;

      expect(columns).toHaveLength(2);
      expect(columns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ column_name: "user_uuid_id", is_nullable: "YES" }),
          expect.objectContaining({ column_name: "uuid_id", is_nullable: "YES" }),
        ])
      );
    });

    it("should have created id_mappings table", async () => {
      const tableInfo = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'id_mappings'
      `;

      expect(tableInfo).toHaveLength(1);
    });
  });

  describe("Unique Constraints Verification", () => {
    it("should have unique constraints on UUID fields", async () => {
      const constraints = await prisma.$queryRaw`
        SELECT conname, conrelid::regclass::text as table_name
        FROM pg_constraint
        WHERE contype = 'u'
        AND connamespace = 'public'::regnamespace
        AND conname LIKE '%uuid%' OR conname LIKE '%auth_id%'
        ORDER BY conname
      `;

      const constraintNames = (constraints as Array<{ conname: string }>).map((c) => c.conname);
      expect(constraintNames).toContain("users_auth_id_key");
      expect(constraintNames).toContain("users_uuid_id_key");
      expect(constraintNames).toContain("clinics_uuid_id_key");
      expect(constraintNames).toContain("dashboards_uuid_id_key");
    });
  });

  describe("ID Mapping Functionality", () => {
    it("should be able to create and query ID mappings", async () => {
      const testMapping = await prisma.idMapping.create({
        data: {
          tableName: "test_table",
          oldId: "old-cuid-123",
          newId: "new-uuid-456",
        },
      });

      expect(testMapping.id).toBeDefined();
      expect(testMapping.tableName).toBe("test_table");
      expect(testMapping.oldId).toBe("old-cuid-123");
      expect(testMapping.newId).toBe("new-uuid-456");

      // Test unique constraint
      await expect(
        prisma.idMapping.create({
          data: {
            tableName: "test_table",
            oldId: "old-cuid-123",
            newId: "different-uuid",
          },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.idMapping.delete({ where: { id: testMapping.id } });
    });
  });

  describe("UUID Field Population", () => {
    it("should handle UUID population for User model", async () => {
      // Create test user without UUID
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          name: "Test User",
          role: "admin",
          clinicId: "test-clinic-id",
        },
      });

      // Update with UUID
      const uuid = crypto.randomUUID();
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { uuidId: uuid },
      });

      expect(updatedUser.uuidId).toBe(uuid);

      // Clean up
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });

  describe("Dashboard User UUID Relationship", () => {
    it("should support dual ID references", async () => {
      const testDashboard = await prisma.dashboard.create({
        data: {
          name: "Test Dashboard",
          userId: "test-user-cuid",
          userUuidId: "test-user-uuid",
        },
      });

      expect(testDashboard.userId).toBe("test-user-cuid");
      expect(testDashboard.userUuidId).toBe("test-user-uuid");

      // Clean up
      await prisma.dashboard.delete({ where: { id: testDashboard.id } });
    });
  });
});

/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

describe('Multi-Tenant Tables Migration', () => {
  // Clean up any test data after tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Table Creation Verification', () => {
    it('should have created UserClinicRole table', async () => {
      const tableInfo = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_clinic_roles'
      `;
      
      expect(Array.isArray(tableInfo)).toBe(true);
      expect(tableInfo).toHaveLength(1);
    });

    it('should have created all multi-tenant metric tables', async () => {
      const tables = [
        'goal_templates',
        'financial_metrics',
        'appointment_metrics',
        'call_metrics',
        'patient_metrics',
        'metric_aggregations',
        'google_credentials',
        'spreadsheet_connections',
        'column_mappings_v2'
      ];

      for (const tableName of tables) {
        const tableInfo = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        `;
        
        expect(Array.isArray(tableInfo)).toBe(true);
        expect(tableInfo).toHaveLength(1);
      }
    });
  });

  describe('Index Verification', () => {
    it('should have created required indexes on user_clinic_roles', async () => {
      const indexes = await prisma.$queryRaw`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'user_clinic_roles'
        AND schemaname = 'public'
      `;
      
      const indexNames = (indexes as any[]).map(idx => idx.indexname);
      expect(indexNames).toContain('user_clinic_roles_pkey');
      expect(indexNames).toContain('user_clinic_roles_clinic_id_idx');
      expect(indexNames).toContain('user_clinic_roles_user_id_idx');
      expect(indexNames).toContain('user_clinic_roles_user_id_clinic_id_key');
    });

    it('should have created composite indexes for performance', async () => {
      const compositeIndexes = await prisma.$queryRaw`
        SELECT indexname, tablename
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE '%_clinic_id_date_idx'
      `;
      
      expect(Array.isArray(compositeIndexes)).toBe(true);
      expect((compositeIndexes as any[]).length).toBeGreaterThan(0);
    });
  });

  describe('Column Type Verification', () => {
    it('should have correct decimal precision for financial columns', async () => {
      const columnInfo = await prisma.$queryRaw`
        SELECT column_name, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'financial_metrics'
        AND column_name = 'amount'
      `;
      
      const column = (columnInfo as any[])[0];
      expect(column.numeric_precision).toBe(10);
      expect(column.numeric_scale).toBe(2);
    });

    it('should have JSONB columns for flexible configuration', async () => {
      const columnInfo = await prisma.$queryRaw`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'column_mappings_v2'
        AND column_name = 'mapping_config'
      `;
      
      const column = (columnInfo as any[])[0];
      expect(column.data_type).toBe('jsonb');
    });
  });

  describe('Constraint Verification', () => {
    it('should have unique constraints on key tables', async () => {
      const constraints = await prisma.$queryRaw`
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'UNIQUE'
        AND table_schema = 'public'
        AND table_name IN ('user_clinic_roles', 'google_credentials', 'spreadsheet_connections', 'metric_aggregations')
      `;
      
      expect(Array.isArray(constraints)).toBe(true);
      expect((constraints as any[]).length).toBeGreaterThan(0);
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should be able to create and query UserClinicRole', async () => {
      const testRole = await prisma.userClinicRole.create({
        data: {
          userId: 'test-user-' + Date.now(),
          clinicId: 'test-clinic-' + Date.now(),
          role: 'clinic_admin',
          isActive: true,
          createdBy: 'migration-test',
        },
      });

      expect(testRole.id).toBeDefined();
      expect(testRole.role).toBe('clinic_admin');

      // Clean up
      await prisma.userClinicRole.delete({ where: { id: testRole.id } });
    });

    it('should be able to create financial metrics with proper decimal handling', async () => {
      const testMetric = await prisma.financialMetric.create({
        data: {
          clinicId: 'test-clinic-' + Date.now(),
          date: new Date(),
          metricType: 'production',
          category: 'test',
          amount: 1234.56,
        },
      });

      expect(testMetric.amount.toString()).toBe('1234.56');

      // Clean up
      await prisma.financialMetric.delete({ where: { id: testMetric.id } });
    });

    it('should be able to store JSONB configuration in column mappings', async () => {
      const testMapping = await prisma.columnMappingV2.create({
        data: {
          connectionId: 'test-connection-' + Date.now(),
          sheetName: 'TestSheet',
          mappingConfig: {
            mappings: [
              { source: 'A', target: 'field1', transform: 'uppercase' },
              { source: 'B', target: 'field2', transform: 'number' },
            ],
            version: '1.0',
          },
        },
      });

      expect(testMapping.mappingConfig).toHaveProperty('mappings');
      expect((testMapping.mappingConfig as any).mappings).toHaveLength(2);

      // Clean up
      await prisma.columnMappingV2.delete({ where: { id: testMapping.id } });
    });
  });
});
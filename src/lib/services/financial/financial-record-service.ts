import { prisma } from '@/lib/database/client';
import { BaseService } from '../base/base-service';
import { FinancialCalculatorService } from './financial-calculator';
import type {
  CreateFinancialData,
  FinancialRecordWithDetails,
  UpdateFinancialData,
  UpsertFinancialData,
} from './types';

/**
 * Service for managing financial record CRUD operations
 */
export class FinancialRecordService extends BaseService {
  private calculator = new FinancialCalculatorService();

  /**
   * Create a new financial record
   */
  async createRecord(data: CreateFinancialData): Promise<FinancialRecordWithDetails> {
    try {
      this.validateRequired(data, ['clinicId', 'locationId', 'date']);

      // Calculate derived fields
      const derived = this.calculator.calculateAllDerivedFields(data);

      const record = await prisma.locationFinancial.create({
        data: {
          clinic: { connect: { id: data.clinicId } },
          location: { connect: { id: data.locationId } },
          date: data.date,
          production: data.production,
          adjustments: data.adjustments,
          writeOffs: data.writeOffs,
          netProduction: derived.netProduction,
          patientIncome: data.patientIncome,
          insuranceIncome: data.insuranceIncome,
          totalCollections: derived.totalCollections,
          unearned: data.unearned,
          ...(data.dataSourceId && { dataSource: { connect: { id: data.dataSourceId } } }),
        },
        include: {
          location: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          dataSource: {
            select: {
              id: true,
              name: true,
              lastSyncedAt: true,
            },
          },
        },
      });

      return record;
    } catch (error) {
      this.handleError(error, 'Failed to create financial record');
    }
  }

  /**
   * Update an existing financial record by ID
   */
  async updateRecord(id: string, data: UpdateFinancialData): Promise<FinancialRecordWithDetails> {
    try {
      this.validateRequired({ id }, ['id']);

      // Get current record to calculate derived fields
      const currentRecord = await prisma.locationFinancial.findUnique({
        where: { id },
      });

      if (!currentRecord) {
        throw new Error('Financial record not found');
      }

      // Merge current data with updates for calculations
      const mergedData = {
        production: data.production ?? currentRecord.production,
        adjustments: data.adjustments ?? currentRecord.adjustments,
        writeOffs: data.writeOffs ?? currentRecord.writeOffs,
        patientIncome: data.patientIncome ?? currentRecord.patientIncome,
        insuranceIncome: data.insuranceIncome ?? currentRecord.insuranceIncome,
      };

      // Calculate derived fields
      const derived = this.calculator.calculateAllDerivedFields(mergedData);

      const record = await prisma.locationFinancial.update({
        where: { id },
        data: {
          ...data,
          netProduction: derived.netProduction,
          totalCollections: derived.totalCollections,
          ...(data.dataSourceId && { dataSource: { connect: { id: data.dataSourceId } } }),
        },
        include: {
          location: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          dataSource: {
            select: {
              id: true,
              name: true,
              lastSyncedAt: true,
            },
          },
        },
      });

      return record;
    } catch (error) {
      this.handleError(error, 'Failed to update financial record');
    }
  }

  /**
   * Upsert a financial record by location and date
   */
  async upsertByDate(
    locationId: string,
    date: Date,
    data: UpsertFinancialData
  ): Promise<{ record: FinancialRecordWithDetails; wasCreated: boolean }> {
    try {
      this.validateRequired({ locationId, date }, ['locationId', 'date']);

      // Calculate derived fields
      const derived = this.calculator.calculateAllDerivedFields(data);

      const result = await prisma.locationFinancial.upsert({
        where: {
          clinicId_locationId_date: {
            clinicId: data.clinicId,
            locationId: locationId,
            date: date,
          },
        },
        update: {
          production: data.production,
          adjustments: data.adjustments,
          writeOffs: data.writeOffs,
          netProduction: derived.netProduction,
          patientIncome: data.patientIncome,
          insuranceIncome: data.insuranceIncome,
          totalCollections: derived.totalCollections,
          unearned: data.unearned,
          ...(data.dataSourceId && { dataSource: { connect: { id: data.dataSourceId } } }),
        },
        create: {
          clinic: { connect: { id: data.clinicId } },
          location: { connect: { id: locationId } },
          date: date,
          production: data.production,
          adjustments: data.adjustments,
          writeOffs: data.writeOffs,
          netProduction: derived.netProduction,
          patientIncome: data.patientIncome,
          insuranceIncome: data.insuranceIncome,
          totalCollections: derived.totalCollections,
          unearned: data.unearned,
          ...(data.dataSourceId && { dataSource: { connect: { id: data.dataSourceId } } }),
        },
        include: {
          location: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          dataSource: {
            select: {
              id: true,
              name: true,
              lastSyncedAt: true,
            },
          },
        },
      });

      // Determine if this was a create or update by comparing timestamps
      const timeDiff = Math.abs(result.updatedAt.getTime() - result.createdAt.getTime());
      const wasCreated = timeDiff <= 1000; // Within 1 second indicates creation

      return { record: result, wasCreated };
    } catch (error) {
      this.handleError(error, 'Failed to upsert financial record');
    }
  }

  /**
   * Delete a financial record
   */
  async deleteRecord(id: string): Promise<void> {
    try {
      this.validateRequired({ id }, ['id']);

      await prisma.locationFinancial.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'Failed to delete financial record');
    }
  }

  /**
   * Check if a record exists for the given criteria
   */
  async recordExists(clinicId: string, locationId: string, date: Date): Promise<boolean> {
    try {
      const count = await prisma.locationFinancial.count({
        where: {
          clinicId,
          locationId,
          date,
        },
      });

      return count > 0;
    } catch (error) {
      this.handleError(error, 'Failed to check record existence');
    }
  }

  /**
   * Get a single financial record by ID
   */
  async getRecordById(id: string): Promise<FinancialRecordWithDetails | null> {
    try {
      const record = await prisma.locationFinancial.findUnique({
        where: { id },
        include: {
          location: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          dataSource: {
            select: {
              id: true,
              name: true,
              lastSyncedAt: true,
            },
          },
        },
      });

      return record;
    } catch (error) {
      this.handleError(error, 'Failed to get financial record');
    }
  }
}

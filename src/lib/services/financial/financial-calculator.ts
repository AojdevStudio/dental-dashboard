import type { DerivedFields } from './types';

/**
 * Service for calculating financial metrics and derived fields
 */
export class FinancialCalculatorService {
  /**
   * Calculate net production (production - adjustments - writeOffs)
   */
  calculateNetProduction(production: number, adjustments: number, writeOffs: number): number {
    return Math.max(0, production - adjustments - writeOffs);
  }

  /**
   * Calculate total collections (patient income + insurance income)
   */
  calculateTotalCollections(patientIncome: number, insuranceIncome: number): number {
    return patientIncome + insuranceIncome;
  }

  /**
   * Calculate collection rate as percentage
   */
  calculateCollectionRate(collections: number, production: number): number {
    if (production === 0) {
      return 0;
    }
    return Math.round((collections / production) * 10000) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate adjustment rate as percentage
   */
  calculateAdjustmentRate(adjustments: number, production: number): number {
    if (production === 0) {
      return 0;
    }
    return Math.round((adjustments / production) * 10000) / 100;
  }

  /**
   * Calculate write-off rate as percentage
   */
  calculateWriteOffRate(writeOffs: number, production: number): number {
    if (production === 0) {
      return 0;
    }
    return Math.round((writeOffs / production) * 10000) / 100;
  }

  /**
   * Calculate all derived fields at once
   */
  calculateAllDerivedFields(data: {
    production: number;
    adjustments: number;
    writeOffs: number;
    patientIncome: number;
    insuranceIncome: number;
  }): DerivedFields {
    const { production, adjustments, writeOffs, patientIncome, insuranceIncome } = data;

    const netProduction = this.calculateNetProduction(production, adjustments, writeOffs);
    const totalCollections = this.calculateTotalCollections(patientIncome, insuranceIncome);
    const collectionRate = this.calculateCollectionRate(totalCollections, production);
    const adjustmentRate = this.calculateAdjustmentRate(adjustments, production);
    const writeOffRate = this.calculateWriteOffRate(writeOffs, production);

    return {
      netProduction,
      totalCollections,
      collectionRate,
      adjustmentRate,
      writeOffRate,
    };
  }

  /**
   * Validate and normalize numeric input
   */
  normalizeNumericInput(value: unknown): number {
    const num = Number.parseFloat(value?.toString() || '0');
    return Number.isNaN(num) ? 0 : Math.max(0, num);
  }

  /**
   * Calculate summary statistics for multiple records
   */
  calculateSummaryStats(
    records: Array<{
      production: number;
      adjustments: number;
      writeOffs: number;
      patientIncome: number;
      insuranceIncome: number;
    }>
  ): {
    totalProduction: number;
    totalAdjustments: number;
    totalWriteOffs: number;
    totalCollections: number;
    netProduction: number;
    averageCollectionRate: number;
    recordCount: number;
  } {
    if (records.length === 0) {
      return {
        totalProduction: 0,
        totalAdjustments: 0,
        totalWriteOffs: 0,
        totalCollections: 0,
        netProduction: 0,
        averageCollectionRate: 0,
        recordCount: 0,
      };
    }

    const totals = records.reduce(
      (acc, record) => ({
        production: acc.production + record.production,
        adjustments: acc.adjustments + record.adjustments,
        writeOffs: acc.writeOffs + record.writeOffs,
        collections: acc.collections + record.patientIncome + record.insuranceIncome,
      }),
      { production: 0, adjustments: 0, writeOffs: 0, collections: 0 }
    );

    const netProduction = this.calculateNetProduction(
      totals.production,
      totals.adjustments,
      totals.writeOffs
    );

    const averageCollectionRate = this.calculateCollectionRate(
      totals.collections,
      totals.production
    );

    return {
      totalProduction: totals.production,
      totalAdjustments: totals.adjustments,
      totalWriteOffs: totals.writeOffs,
      totalCollections: totals.collections,
      netProduction,
      averageCollectionRate,
      recordCount: records.length,
    };
  }
}

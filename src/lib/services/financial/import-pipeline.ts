import { prisma } from '@/lib/database/client';
import { BaseService } from '../base/base-service';
import { FinancialCalculatorService } from './financial-calculator';
import { FinancialRecordService } from './financial-record-service';
import { type ImportRecord, ImportRecordValidator } from './financial-validator';
import type { ProcessingResult } from './types';

export interface ImportOptions {
  clinicId: string;
  dataSourceId?: string;
  upsert?: boolean;
  dryRun?: boolean;
}

export interface ValidatedFinancialData extends Record<string, unknown> {
  clinicId: string;
  locationId: string;
  locationName: string;
  date: Date;
  production: number;
  adjustments: number;
  writeOffs: number;
  netProduction: number;
  patientIncome: number;
  insuranceIncome: number;
  totalCollections: number;
  unearned: number | null;
  dataSourceId?: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  validRecords: ValidatedFinancialData[];
  errors: string[];
  warnings: string[];
  totalRecords: number;
  validCount: number;
}

export interface ImportProcessingResult extends ProcessingResult {
  processedRecords: Array<{
    locationName: string;
    date: string;
    production: number;
    status: 'success' | 'created' | 'updated' | 'failed';
  }>;
}

export interface ImportResult {
  success: boolean;
  dryRun: boolean;
  validation: ImportValidationResult;
  processing?: ImportProcessingResult;
  message: string;
}

/**
 * Service for handling bulk financial data imports with validation and processing pipeline
 */
export class FinancialImportPipeline extends BaseService {
  private recordService = new FinancialRecordService();
  private calculator = new FinancialCalculatorService();
  private validator = new ImportRecordValidator();

  /**
   * Execute the complete import pipeline
   */
  async execute(records: ImportRecord[], options: ImportOptions): Promise<ImportResult> {
    try {
      // Step 1: Validate input and clinic
      await this.validateClinic(options.clinicId);

      // Step 2: Validate and transform records
      const validationResult = await this.validateRecords(records, options);

      // If there are validation errors or it's a dry run, return early
      if (!validationResult.isValid || options.dryRun) {
        return {
          success: validationResult.isValid,
          dryRun: options.dryRun ?? false,
          validation: validationResult,
          message: options.dryRun ? 'Dry run completed successfully' : 'Validation failed',
        };
      }

      // Step 3: Process valid records
      const processingResult = await this.processRecords(validationResult.validRecords, options);

      // Step 4: Update data source sync timestamp
      if (options.dataSourceId && processingResult.created + processingResult.updated > 0) {
        await this.updateDataSourceSync(options.dataSourceId);
      }

      return {
        success: true,
        dryRun: false,
        validation: validationResult,
        processing: processingResult,
        message: 'Import completed successfully',
      };
    } catch (error) {
      this.handleError(error, 'Import pipeline failed');
    }
  }

  /**
   * Validate that the clinic exists and get location mapping
   */
  private async validateClinic(
    clinicId: string
  ): Promise<Map<string, { id: string; name: string; isActive: boolean }>> {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        locations: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!clinic) {
      throw new Error('Clinic not found');
    }

    return new Map(clinic.locations.map((loc) => [loc.name.toLowerCase(), loc]));
  }

  /**
   * Validate and transform import records
   */
  private async validateRecords(
    records: ImportRecord[],
    options: ImportOptions
  ): Promise<ImportValidationResult> {
    // Basic validation
    const validationResult = this.validator.validate(records);
    if (!validationResult.isValid) {
      return {
        isValid: false,
        validRecords: [],
        errors: validationResult.errors.map((e) => e.message),
        warnings: validationResult.warnings,
        totalRecords: records.length,
        validCount: 0,
      };
    }

    // Get location mapping
    const locationMap = await this.validateClinic(options.clinicId);

    const validRecords: ValidatedFinancialData[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordIndex = i + 1;

      try {
        const result = await this.validateAndTransformRecord(
          record,
          recordIndex,
          locationMap,
          options
        );

        if (result.errors.length > 0) {
          errors.push(...result.errors);
        } else {
          validRecords.push(result.data!);
          warnings.push(...result.warnings);
        }
      } catch (error) {
        errors.push(
          `Record ${recordIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      validRecords,
      errors,
      warnings,
      totalRecords: records.length,
      validCount: validRecords.length,
    };
  }

  /**
   * Validate and transform a single record
   */
  private async validateAndTransformRecord(
    record: ImportRecord,
    recordIndex: number,
    locationMap: Map<string, { id: string; name: string; isActive: boolean }>,
    options: ImportOptions
  ): Promise<{
    data?: ValidatedFinancialData;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prefix = `Record ${recordIndex}`;

    // Validate date
    const recordDate = new Date(record.date);
    if (Number.isNaN(recordDate.getTime())) {
      errors.push(`${prefix}: Invalid date format`);
      return { errors, warnings };
    }

    // Find location
    const locationKey = record.locationName.toLowerCase().trim();
    const location = locationMap.get(locationKey);

    if (!location) {
      errors.push(`${prefix}: Location "${record.locationName}" not found`);
      return { errors, warnings };
    }

    if (!location.isActive) {
      warnings.push(`${prefix}: Location "${record.locationName}" is inactive`);
    }

    // Normalize numeric fields
    const production = this.calculator.normalizeNumericInput(record.production);
    const adjustments = this.calculator.normalizeNumericInput(record.adjustments);
    const writeOffs = this.calculator.normalizeNumericInput(record.writeOffs);
    const patientIncome = this.calculator.normalizeNumericInput(record.patientIncome);
    const insuranceIncome = this.calculator.normalizeNumericInput(record.insuranceIncome);
    const unearned = record.unearned
      ? this.calculator.normalizeNumericInput(record.unearned)
      : null;

    // Calculate derived fields
    const derived = this.calculator.calculateAllDerivedFields({
      production,
      adjustments,
      writeOffs,
      patientIncome,
      insuranceIncome,
    });

    // Check for duplicate if not in upsert mode
    if (!options.upsert) {
      const existingRecord = await this.recordService.recordExists(
        options.clinicId,
        location.id,
        recordDate
      );

      if (existingRecord) {
        warnings.push(
          `${prefix}: Data already exists for ${record.locationName} on ${record.date}`
        );
        return { errors, warnings };
      }
    }

    const validatedData: ValidatedFinancialData = {
      clinicId: options.clinicId,
      locationId: location.id,
      locationName: record.locationName,
      date: recordDate,
      production,
      adjustments,
      writeOffs,
      netProduction: derived.netProduction,
      patientIncome,
      insuranceIncome,
      totalCollections: derived.totalCollections,
      unearned,
      dataSourceId: options.dataSourceId,
    };

    return {
      data: validatedData,
      errors,
      warnings,
    };
  }

  /**
   * Process validated records
   */
  private async processRecords(
    validRecords: ValidatedFinancialData[],
    options: ImportOptions
  ): Promise<ImportProcessingResult> {
    const results: ProcessingResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    };

    const processedRecords: Array<{
      locationName: string;
      date: string;
      production: number;
      status: 'success' | 'created' | 'updated' | 'failed';
    }> = [];

    for (const record of validRecords) {
      try {
        if (options.upsert) {
          const result = await this.recordService.upsertByDate(
            record.locationId,
            record.date,
            record
          );

          if (result.wasCreated) {
            results.created++;
          } else {
            results.updated++;
          }

          processedRecords.push({
            locationName: record.locationName,
            date: record.date.toISOString().split('T')[0],
            production: record.production,
            status: result.wasCreated ? 'created' : 'updated',
          });
        } else {
          await this.recordService.createRecord(record);
          results.created++;

          processedRecords.push({
            locationName: record.locationName,
            date: record.date.toISOString().split('T')[0],
            production: record.production,
            status: 'created',
          });
        }
      } catch (_error) {
        results.failed++;
        processedRecords.push({
          locationName: record.locationName,
          date: record.date.toISOString().split('T')[0],
          production: record.production,
          status: 'failed',
        });
      }
    }

    return {
      ...results,
      processedRecords,
    };
  }

  /**
   * Update data source sync timestamp
   */
  private async updateDataSourceSync(dataSourceId: string): Promise<void> {
    try {
      await prisma.dataSource.update({
        where: { id: dataSourceId },
        data: { lastSyncedAt: new Date() },
      });
    } catch (_error) {}
  }
}

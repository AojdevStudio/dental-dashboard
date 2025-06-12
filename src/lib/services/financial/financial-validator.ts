import { BaseValidator, type ValidationResult } from '../base/base-validator';
import type { CreateFinancialData, UpdateFinancialData } from './types';

/**
 * Validator for financial data operations
 */
export class FinancialDataValidator extends BaseValidator<CreateFinancialData> {
  validate(data: CreateFinancialData): ValidationResult {
    this.reset();

    this.validateRequiredFields(data);
    this.validateNumericFields(data);
    this.validateDateFields(data);
    this.validateBusinessRules(data);

    return this.createResult();
  }

  /**
   * Validate update data
   */
  validateUpdate(data: UpdateFinancialData): ValidationResult {
    this.reset();

    this.validateNumericFields(data);
    this.validateBusinessRules(data);

    return this.createResult();
  }

  private validateRequiredFields(data: CreateFinancialData): void {
    this.validateRequired('clinicId', data.clinicId);
    this.validateRequired('locationId', data.locationId);
    this.validateRequired('date', data.date);
  }

  private validateNumericFields(data: Partial<CreateFinancialData>): void {
    // Production must be non-negative
    if (data.production !== undefined) {
      this.validateNumeric('production', data.production, 0);
    }

    // Adjustments must be non-negative
    if (data.adjustments !== undefined) {
      this.validateNumeric('adjustments', data.adjustments, 0);
    }

    // Write-offs must be non-negative
    if (data.writeOffs !== undefined) {
      this.validateNumeric('writeOffs', data.writeOffs, 0);
    }

    // Patient income must be non-negative
    if (data.patientIncome !== undefined) {
      this.validateNumeric('patientIncome', data.patientIncome, 0);
    }

    // Insurance income must be non-negative
    if (data.insuranceIncome !== undefined) {
      this.validateNumeric('insuranceIncome', data.insuranceIncome, 0);
    }

    // Unearned can be null or non-negative
    if (data.unearned !== undefined && data.unearned !== null) {
      this.validateNumeric('unearned', data.unearned, 0);
    }
  }

  private validateDateFields(data: Partial<CreateFinancialData>): void {
    if (data.date) {
      this.validateDate('date', data.date);

      // Check if date is not in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (data.date > today) {
        this.addWarning('Financial data date is in the future');
      }

      // Check if date is not too old (more than 5 years)
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      if (data.date < fiveYearsAgo) {
        this.addWarning('Financial data date is more than 5 years old');
      }
    }
  }

  private validateBusinessRules(data: Partial<CreateFinancialData>): void {
    const production = data.production || 0;
    const adjustments = data.adjustments || 0;
    const writeOffs = data.writeOffs || 0;
    const patientIncome = data.patientIncome || 0;
    const insuranceIncome = data.insuranceIncome || 0;

    // Adjustments and write-offs shouldn't exceed production
    if (adjustments + writeOffs > production) {
      this.addWarning('Adjustments and write-offs exceed production amount');
    }

    // Collections shouldn't be significantly higher than production (warn if > 150%)
    const totalCollections = patientIncome + insuranceIncome;
    if (totalCollections > production * 1.5) {
      this.addWarning('Total collections significantly exceed production (>150%)');
    }

    // Warn if production is 0 but there are collections
    if (production === 0 && totalCollections > 0) {
      this.addWarning('Collections reported without corresponding production');
    }

    // Warn if adjustments are more than 50% of production
    if (production > 0 && adjustments > production * 0.5) {
      this.addWarning('Adjustments exceed 50% of production');
    }

    // Warn if write-offs are more than 25% of production
    if (production > 0 && writeOffs > production * 0.25) {
      this.addWarning('Write-offs exceed 25% of production');
    }
  }
}

/**
 * Import-specific validator for batch operations
 */
export interface ImportRecord {
  date: string;
  locationName: string;
  production?: number;
  adjustments?: number;
  writeOffs?: number;
  patientIncome?: number;
  insuranceIncome?: number;
  unearned?: number;
}

export class ImportRecordValidator extends BaseValidator<ImportRecord[]> {
  validate(records: ImportRecord[]): ValidationResult {
    this.reset();

    if (!Array.isArray(records) || records.length === 0) {
      this.addError('records', 'Records array is required and cannot be empty');
      return this.createResult();
    }

    records.forEach((record, index) => {
      this.validateImportRecord(record, index + 1);
    });

    return this.createResult();
  }

  private validateImportRecord(record: ImportRecord, recordNumber: number): void {
    const prefix = `Record ${recordNumber}`;

    // Required fields
    if (!record.date) {
      this.addError(`${prefix}.date`, 'Date is required');
    }

    if (!record.locationName || record.locationName.trim() === '') {
      this.addError(`${prefix}.locationName`, 'Location name is required');
    }

    // Validate date format
    if (record.date) {
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime())) {
        this.addError(`${prefix}.date`, 'Invalid date format');
      }
    }

    // Validate numeric fields
    this.validateImportNumericField(record.production, `${prefix}.production`);
    this.validateImportNumericField(record.adjustments, `${prefix}.adjustments`);
    this.validateImportNumericField(record.writeOffs, `${prefix}.writeOffs`);
    this.validateImportNumericField(record.patientIncome, `${prefix}.patientIncome`);
    this.validateImportNumericField(record.insuranceIncome, `${prefix}.insuranceIncome`);
    this.validateImportNumericField(record.unearned, `${prefix}.unearned`, true);
  }

  private validateImportNumericField(value: any, fieldName: string, allowNull = false): void {
    if (value === undefined || value === null || value === '') {
      if (!allowNull) {
        // For optional fields, default to 0
        return;
      }
      return;
    }

    const num = Number.parseFloat(value.toString());
    if (Number.isNaN(num)) {
      this.addError(fieldName, 'Must be a valid number');
    } else if (num < 0) {
      this.addError(fieldName, 'Must be non-negative');
    }
  }
}

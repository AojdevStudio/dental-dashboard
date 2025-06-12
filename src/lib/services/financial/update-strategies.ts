import { BaseService } from '../base/base-service';
import { FinancialCalculatorService } from './financial-calculator';
import { FinancialRecordService } from './financial-record-service';
import { FinancialDataValidator } from './financial-validator';
import type { CreateFinancialData, FinancialRecordWithDetails, UpdateFinancialData } from './types';

export interface UpdateRequestData {
  recordId?: string;
  date?: string;
  production?: string | number;
  adjustments?: string | number;
  writeOffs?: string | number;
  patientIncome?: string | number;
  insuranceIncome?: string | number;
  unearned?: string | number | null;
}

export interface UpdateContext {
  locationId: string;
  clinicId: string;
}

export interface UpdateResult {
  record: FinancialRecordWithDetails;
  wasCreated: boolean;
}

/**
 * Strategy interface for different update operations
 */
export interface FinancialUpdateStrategy {
  update(data: UpdateRequestData, context: UpdateContext): Promise<UpdateResult>;
  validate(data: UpdateRequestData, context: UpdateContext): Promise<void>;
}

/**
 * Strategy for updating records by record ID
 */
export class RecordIdUpdateStrategy extends BaseService implements FinancialUpdateStrategy {
  constructor(
    private recordService: FinancialRecordService,
    private calculator: FinancialCalculatorService,
    private validator: FinancialDataValidator
  ) {
    super();
  }

  async validate(data: UpdateRequestData, _context: UpdateContext): Promise<void> {
    this.validateRequired({ recordId: data.recordId }, ['recordId']);

    // Validate update data if provided
    const updateData: Partial<UpdateFinancialData> = {};

    if (data.production !== undefined) {
      updateData.production = this.parseNumeric(data.production);
    }
    if (data.adjustments !== undefined) {
      updateData.adjustments = this.parseNumeric(data.adjustments);
    }
    if (data.writeOffs !== undefined) {
      updateData.writeOffs = this.parseNumeric(data.writeOffs);
    }
    if (data.patientIncome !== undefined) {
      updateData.patientIncome = this.parseNumeric(data.patientIncome);
    }
    if (data.insuranceIncome !== undefined) {
      updateData.insuranceIncome = this.parseNumeric(data.insuranceIncome);
    }

    const validationResult = this.validator.validateUpdate(updateData);
    if (!validationResult.isValid) {
      throw new Error(
        `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`
      );
    }
  }

  async update(data: UpdateRequestData, context: UpdateContext): Promise<UpdateResult> {
    await this.validate(data, context);

    // Check that record exists and belongs to the location
    const existingRecord = await this.recordService.getRecordById(data.recordId!);
    if (!existingRecord) {
      throw new Error('Financial record not found');
    }

    if (existingRecord.locationId !== context.locationId) {
      throw new Error('Record does not belong to the specified location');
    }

    // Build update data
    const updateData: UpdateFinancialData = {};

    if (data.production !== undefined) {
      updateData.production = this.parseNumeric(data.production);
    }
    if (data.adjustments !== undefined) {
      updateData.adjustments = this.parseNumeric(data.adjustments);
    }
    if (data.writeOffs !== undefined) {
      updateData.writeOffs = this.parseNumeric(data.writeOffs);
    }
    if (data.patientIncome !== undefined) {
      updateData.patientIncome = this.parseNumeric(data.patientIncome);
    }
    if (data.insuranceIncome !== undefined) {
      updateData.insuranceIncome = this.parseNumeric(data.insuranceIncome);
    }
    if (data.unearned !== undefined) {
      updateData.unearned = data.unearned ? this.parseNumeric(data.unearned) : null;
    }

    const record = await this.recordService.updateRecord(data.recordId!, updateData);

    return {
      record,
      wasCreated: false,
    };
  }

  private parseNumeric(value: string | number): number {
    const num = typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(num)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }
    return Math.max(0, num);
  }
}

/**
 * Strategy for upserting records by date
 */
export class DateUpsertStrategy extends BaseService implements FinancialUpdateStrategy {
  constructor(
    private recordService: FinancialRecordService,
    private calculator: FinancialCalculatorService,
    private validator: FinancialDataValidator
  ) {
    super();
  }

  async validate(data: UpdateRequestData, context: UpdateContext): Promise<void> {
    this.validateRequired({ date: data.date }, ['date']);

    // Validate date format
    const date = new Date(data.date!);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Create validation data
    const createData: CreateFinancialData = {
      clinicId: context.clinicId,
      locationId: context.locationId,
      date,
      production: this.parseNumeric(data.production, 0),
      adjustments: this.parseNumeric(data.adjustments, 0),
      writeOffs: this.parseNumeric(data.writeOffs, 0),
      patientIncome: this.parseNumeric(data.patientIncome, 0),
      insuranceIncome: this.parseNumeric(data.insuranceIncome, 0),
      unearned: data.unearned ? this.parseNumeric(data.unearned, 0) : null,
    };

    const validationResult = this.validator.validate(createData);
    if (!validationResult.isValid) {
      throw new Error(
        `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`
      );
    }
  }

  async update(data: UpdateRequestData, context: UpdateContext): Promise<UpdateResult> {
    await this.validate(data, context);

    const date = new Date(data.date!);

    // Build upsert data
    const upsertData: CreateFinancialData = {
      clinicId: context.clinicId,
      locationId: context.locationId,
      date,
      production: this.parseNumeric(data.production, 0),
      adjustments: this.parseNumeric(data.adjustments, 0),
      writeOffs: this.parseNumeric(data.writeOffs, 0),
      patientIncome: this.parseNumeric(data.patientIncome, 0),
      insuranceIncome: this.parseNumeric(data.insuranceIncome, 0),
      unearned: data.unearned ? this.parseNumeric(data.unearned, 0) : null,
    };

    const result = await this.recordService.upsertByDate(context.locationId, date, upsertData);

    return {
      record: result.record,
      wasCreated: result.wasCreated,
    };
  }

  private parseNumeric(value: string | number | undefined, defaultValue: number): number {
    if (value === undefined) {
      return defaultValue;
    }

    const num = typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(num)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }
    return Math.max(0, num);
  }
}

/**
 * Factory for creating appropriate update strategy
 */
export class FinancialUpdateStrategyFactory {
  static createStrategy(data: UpdateRequestData): FinancialUpdateStrategy {
    const recordService = new FinancialRecordService();
    const calculator = new FinancialCalculatorService();
    const validator = new FinancialDataValidator();

    if (data.recordId) {
      return new RecordIdUpdateStrategy(recordService, calculator, validator);
    }

    if (data.date) {
      return new DateUpsertStrategy(recordService, calculator, validator);
    }

    throw new Error('Either recordId or date is required for update operation');
  }

  static determineStrategyType(data: UpdateRequestData): 'recordId' | 'dateUpsert' | 'invalid' {
    if (data.recordId) {
      return 'recordId';
    }
    if (data.date) {
      return 'dateUpsert';
    }
    return 'invalid';
  }
}

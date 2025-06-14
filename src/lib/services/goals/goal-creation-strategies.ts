import { z } from 'zod';
import type { AuthContext } from '../../database/auth-context';
import * as goalQueries from '../../database/queries/goals';
import { BaseService } from '../base/base-service';
import { BaseValidator, type ValidationResult } from '../base/base-validator';

// Schema definitions
export const createGoalSchema = z.object({
  metricDefinitionId: z.string().cuid(),
  timePeriod: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetValue: z.string(),
  clinicId: z.string().cuid(),
  providerId: z.string().cuid().optional(),
});

export const createFromTemplateSchema = z.object({
  templateId: z.string().cuid(),
  clinicId: z.string().cuid(),
  providerId: z.string().cuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetValue: z.string().optional(),
});

export type CreateGoalData = z.infer<typeof createGoalSchema>;
export type CreateFromTemplateData = z.infer<typeof createFromTemplateSchema>;
export type GoalCreationResult = Awaited<ReturnType<typeof goalQueries.createGoal>>;

/**
 * Strategy interface for different goal creation methods
 */
export interface GoalCreationStrategy {
  validate(data: unknown): ValidationResult;
  create(data: unknown, authContext: AuthContext): Promise<GoalCreationResult>;
}

/**
 * Validator for goal creation data
 */
export class GoalCreationValidator extends BaseValidator<CreateGoalData | CreateFromTemplateData> {
  validate(data: CreateGoalData | CreateFromTemplateData): ValidationResult {
    this.reset();

    // Basic validation is handled by Zod schemas
    // Additional business rule validation can be added here
    this.validateDateRange(data);

    return this.createResult();
  }

  private validateDateRange(data: CreateGoalData | CreateFromTemplateData): void {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      this.addError('dateRange', 'Start date must be before end date');
    }

    // Check if dates are reasonable (not too far in the past or future)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    if (startDate < oneYearAgo) {
      this.addWarning('Start date is more than one year in the past');
    }

    if (endDate > twoYearsFromNow) {
      this.addWarning('End date is more than two years in the future');
    }
  }
}

/**
 * Strategy for creating goals from templates
 */
export class TemplateGoalCreationStrategy extends BaseService implements GoalCreationStrategy {
  private validator = new GoalCreationValidator();

  validate(data: unknown): ValidationResult {
    try {
      const parsedData = createFromTemplateSchema.parse(data);
      return this.validator.validate(parsedData);
    } catch (_error) {
      return {
        isValid: false,
        errors: [{ field: 'schema', message: 'Invalid request body for template goal creation' }],
        warnings: [],
      };
    }
  }

  async create(data: unknown, authContext: AuthContext): Promise<GoalCreationResult> {
    try {
      const parsedData = createFromTemplateSchema.parse(data);

      const validationResult = this.validate(data);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`
        );
      }

      const goal = await goalQueries.createGoalFromTemplate(authContext, parsedData.templateId, {
        clinicId: parsedData.clinicId,
        providerId: parsedData.providerId,
        startDate: new Date(parsedData.startDate),
        endDate: new Date(parsedData.endDate),
        targetValue: parsedData.targetValue,
      });

      return goal;
    } catch (error) {
      this.handleGoalCreationError(error);
    }
  }

  private handleGoalCreationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes('Access denied')) {
        throw new GoalCreationError(error.message, 403);
      }
      if (error.message.includes('not found')) {
        throw new GoalCreationError(error.message, 404);
      }
      if (error.message.includes('Validation failed')) {
        throw new GoalCreationError(error.message, 400);
      }
    }
    throw error;
  }
}

/**
 * Strategy for creating regular goals
 */
export class RegularGoalCreationStrategy extends BaseService implements GoalCreationStrategy {
  private validator = new GoalCreationValidator();

  validate(data: unknown): ValidationResult {
    try {
      const parsedData = createGoalSchema.parse(data);
      return this.validator.validate(parsedData);
    } catch (_error) {
      return {
        isValid: false,
        errors: [{ field: 'schema', message: 'Invalid request body for goal creation' }],
        warnings: [],
      };
    }
  }

  async create(data: unknown, authContext: AuthContext): Promise<GoalCreationResult> {
    try {
      const parsedData = createGoalSchema.parse(data);

      const validationResult = this.validate(data);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`
        );
      }

      const goalData: goalQueries.CreateGoalInput = {
        metricDefinitionId: parsedData.metricDefinitionId,
        timePeriod: parsedData.timePeriod,
        startDate: new Date(parsedData.startDate),
        endDate: new Date(parsedData.endDate),
        targetValue: parsedData.targetValue,
        clinicId: parsedData.clinicId,
        providerId: parsedData.providerId,
      };

      const goal = await goalQueries.createGoal(authContext, goalData);
      return goal;
    } catch (error) {
      this.handleGoalCreationError(error);
    }
  }

  private handleGoalCreationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes('Access denied')) {
        throw new GoalCreationError(error.message, 403);
      }
      if (error.message.includes('Insufficient permissions')) {
        throw new GoalCreationError(error.message, 403);
      }
      if (error.message.includes('Invalid')) {
        throw new GoalCreationError(error.message, 400);
      }
      if (error.message.includes('Validation failed')) {
        throw new GoalCreationError(error.message, 400);
      }
    }
    throw error;
  }
}

/**
 * Custom error class for goal creation
 */
export class GoalCreationError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'GoalCreationError';
    this.statusCode = statusCode;

    // Ensure proper prototype chain for instanceof checks after transpilation
    Object.setPrototypeOf(this, GoalCreationError.prototype);
  }
}

/**
 * Factory for creating appropriate goal creation strategy
 */
export class GoalCreationStrategyFactory {
  static createStrategy(data: unknown): GoalCreationStrategy {
    // Check if data has templateId to determine strategy
    if (typeof data === 'object' && data !== null && 'templateId' in data) {
      return new TemplateGoalCreationStrategy();
    }

    return new RegularGoalCreationStrategy();
  }

  static determineStrategyType(data: unknown): 'template' | 'regular' {
    if (typeof data === 'object' && data !== null && 'templateId' in data) {
      return 'template';
    }

    return 'regular';
  }
}

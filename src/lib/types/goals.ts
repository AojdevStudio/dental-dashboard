import { z } from 'zod';

// Schema for goal update, used for API input validation
export const updateGoalSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    targetValue: z.coerce
      .string()
      .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, 'Must be a valid positive decimal number')
      .optional(),
    currentValue: z.coerce
      .string()
      .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, 'Must be a valid non-negative decimal number')
      .optional(),
    targetDate: z.string().datetime().optional(), // Represents endDate in Prisma model
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(), // Represents timePeriod in Prisma
    category: z.string().optional(),
    status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
    metricId: z.string().uuid().optional(), // Represents metricDefinitionId in Prisma
  })
  .strict();

// Type inferred from the Zod schema, representing validated API input data
export type UpdateGoalData = z.infer<typeof updateGoalSchema>;

// Interface for the data structure expected by the database query layer (goalQueries.updateGoal)
// This aligns with Prisma model fields and types for an update operation.
export interface UpdateGoalQueryInput {
  name?: string;
  description?: string;
  targetValue?: string; // Prisma Decimal is handled as string for precision
  currentValue?: string; // Prisma Decimal is handled as string for precision
  endDate?: Date | string; // Prisma DateTime for what Zod calls targetDate
  timePeriod?: string; // For what Zod calls frequency
  category?: string;
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  metricDefinitionId?: string; // For what Zod calls metricId
}

/**
 * Utility function to map UpdateGoalData (from Zod validation) to UpdateGoalQueryInput (for database layer)
 * This handles the field name transformations between API and database schemas
 */
export function mapUpdateGoalData(data: UpdateGoalData): UpdateGoalQueryInput {
  const mapped: UpdateGoalQueryInput = {};

  // Direct mappings (same field names)
  if (data.name !== undefined) {
    mapped.name = data.name;
  }
  if (data.description !== undefined) {
    mapped.description = data.description;
  }
  if (data.targetValue !== undefined) {
    mapped.targetValue = data.targetValue;
  }
  if (data.currentValue !== undefined) {
    mapped.currentValue = data.currentValue;
  }
  if (data.category !== undefined) {
    mapped.category = data.category;
  }
  if (data.status !== undefined) {
    mapped.status = data.status;
  }

  // Field name transformations
  if (data.targetDate !== undefined) {
    mapped.endDate = data.targetDate;
  }
  if (data.frequency !== undefined) {
    mapped.timePeriod = data.frequency;
  }
  if (data.metricId !== undefined) {
    mapped.metricDefinitionId = data.metricId;
  }

  return mapped;
}

// TODO: Consider moving GoalResponse here if it becomes shared across different modules or API routes.
// For now, it's defined in `src/app/api/goals/[goalId]/route.ts` as:
// export type GoalResponse = Awaited<ReturnType<typeof goalQueries.getGoalById>>;

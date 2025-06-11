import { z } from "zod";

// Schema for goal update, used for API input validation
export const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  targetDate: z.string().datetime().optional(), // Represents endDate in Prisma model
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(), // Represents timePeriod in Prisma
  category: z.string().optional(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  metricId: z.string().uuid().optional(), // Represents metricDefinitionId in Prisma
});

// Type inferred from the Zod schema, representing validated API input data
export type UpdateGoalData = z.infer<typeof updateGoalSchema>;

// Interface for the data structure expected by the database query layer (goalQueries.updateGoal)
// This aligns with Prisma model fields and types for an update operation.
export interface UpdateGoalQueryInput {
  name?: string;
  description?: string;
  targetValue?: string; // Prisma Decimal is handled as string for precision
  currentValue?: string; // Prisma Decimal is handled as string for precision
  startDate?: Date | string; // Prisma DateTime
  endDate?: Date | string;   // Prisma DateTime for what Zod calls targetDate
  timePeriod?: string; // For what Zod calls frequency
  category?: string;
  status?: "active" | "paused" | "completed" | "cancelled";
  metricDefinitionId?: string; // For what Zod calls metricId
}

// TODO: Consider moving GoalResponse here if it becomes shared across different modules or API routes.
// For now, it's defined in `src/app/api/goals/[goalId]/route.ts` as:
// export type GoalResponse = Awaited<ReturnType<typeof goalQueries.getGoalById>>;

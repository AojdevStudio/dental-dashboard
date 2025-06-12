/**
 * Goals Database Queries
 * Multi-tenant aware goal operations
 */

import type { Prisma } from '@prisma/client';
import type { UpdateGoalQueryInput } from '../../types/goals';
import { type AuthContext, getUserClinicRole, validateClinicAccess } from '../auth-context';
import { prisma } from '../client';

export interface CreateGoalInput {
  metricDefinitionId: string;
  timePeriod: string;
  startDate: Date;
  endDate: Date;
  targetValue: string;
  clinicId: string;
  providerId?: string;
}

export interface GoalFilter {
  clinicId?: string;
  providerId?: string;
  metricDefinitionId?: string;
  active?: boolean;
  timePeriod?: string;
}

/**
 * Get goals with multi-tenant filtering
 */
export async function getGoals(
  authContext: AuthContext,
  filter: GoalFilter,
  options?: {
    limit?: number;
    offset?: number;
    includeProgress?: boolean;
  }
) {
  // Build where clause with clinic access validation
  const where: Prisma.GoalWhereInput = {
    clinicId: {
      in: filter.clinicId ? [filter.clinicId] : authContext.clinicIds,
    },
  };

  // Validate specific clinic access if requested
  if (filter.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, filter.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this clinic');
    }
  }

  // Apply additional filters
  if (filter.providerId) {
    where.providerId = filter.providerId;
  }
  if (filter.metricDefinitionId) {
    where.metricDefinitionId = filter.metricDefinitionId;
  }
  if (filter.timePeriod) {
    where.timePeriod = filter.timePeriod;
  }
  if (filter.active === true) {
    where.endDate = { gte: new Date() };
  } else if (filter.active === false) {
    where.endDate = { lt: new Date() };
  }

  const [goals, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      include: {
        metricDefinition: true,
        clinic: true,
        provider: true,
      },
      orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
      take: options?.limit,
      skip: options?.offset,
    }),
    prisma.goal.count({ where }),
  ]);

  // Optionally calculate progress for each goal
  if (options?.includeProgress) {
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await calculateGoalProgress(goal);
        return { ...goal, progress };
      })
    );
    return { goals: goalsWithProgress, total };
  }

  return { goals, total };
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(
  authContext: AuthContext,
  goalId: string,
  options?: {
    includeProgress?: boolean;
    includeHistory?: boolean;
  }
) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      metricDefinition: true,
      clinic: true,
      provider: true,
    },
  });

  if (!goal) {
    return null;
  }

  // Validate clinic access
  if (goal.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, goal.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this goal');
    }
  }

  let result: Record<string, unknown> = goal;

  // Include progress calculation
  if (options?.includeProgress) {
    const progress = await calculateGoalProgress(goal);
    result = { ...result, progress };
  }

  // Include historical metrics
  if (options?.includeHistory) {
    const history = await prisma.metricValue.findMany({
      where: {
        clinicId: goal.clinicId,
        metricDefinitionId: goal.metricDefinitionId,
        providerId: goal.providerId,
        date: {
          gte: goal.startDate,
          lte: goal.endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
    result = { ...result, history };
  }

  return result;
}

/**
 * Create a new goal
 */
export async function createGoal(authContext: AuthContext, input: CreateGoalInput) {
  // Validate clinic access
  const hasAccess = await validateClinicAccess(authContext, input.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this clinic');
  }

  // Check user role - providers and admins can create goals
  const userRole = await getUserClinicRole(authContext, input.clinicId);
  if (!(userRole && ['clinic_admin', 'provider'].includes(userRole))) {
    throw new Error('Insufficient permissions to create goals');
  }

  // Validate metric definition exists
  const metricDef = await prisma.metricDefinition.findUnique({
    where: { id: input.metricDefinitionId },
  });
  if (!metricDef) {
    throw new Error('Invalid metric definition');
  }

  // Validate provider if specified
  if (input.providerId) {
    const provider = await prisma.provider.findFirst({
      where: {
        id: input.providerId,
        clinicId: input.clinicId,
      },
    });
    if (!provider) {
      throw new Error('Invalid provider for this clinic');
    }
  }

  // Create the goal
  return prisma.goal.create({
    data: input,
    include: {
      metricDefinition: true,
      clinic: true,
      provider: true,
    },
  });
}

/**
 * Update a goal
 */
export async function updateGoal(
  authContext: AuthContext,
  goalId: string,
  input: UpdateGoalQueryInput
) {
  // Get the goal to check permissions
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  // Validate clinic access
  if (goal.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, goal.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this goal');
    }

    // Check user role
    const userRole = await getUserClinicRole(authContext, goal.clinicId);
    if (!(userRole && ['clinic_admin', 'provider'].includes(userRole))) {
      throw new Error('Insufficient permissions to update goals');
    }
  }

  return prisma.goal.update({
    where: { id: goalId },
    data: input,
    include: {
      metricDefinition: true,
      clinic: true,
      provider: true,
    },
  });
}

/**
 * Delete a goal (clinic admin only)
 */
export async function deleteGoal(authContext: AuthContext, goalId: string) {
  // Get the goal to check permissions
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  // Validate clinic access and admin role
  if (goal.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, goal.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this goal');
    }

    const userRole = await getUserClinicRole(authContext, goal.clinicId);
    if (userRole !== 'clinic_admin') {
      throw new Error('Only clinic administrators can delete goals');
    }
  }

  return prisma.goal.delete({
    where: { id: goalId },
  });
}

/**
 * Get goals by template
 */
export async function getGoalsByTemplate(
  authContext: AuthContext,
  templateId: string,
  clinicId?: string
) {
  // Get the template first
  const template = await prisma.goalTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error('Goal template not found');
  }

  // Check access to template
  if (template.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, template.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this template');
    }
  }

  // Build where clause
  const where: Prisma.GoalWhereInput = {
    metricDefinitionId: template.metricDefinitionId,
    timePeriod: template.timePeriod,
  };

  if (clinicId) {
    const hasClinicAccess = await validateClinicAccess(authContext, clinicId);
    if (!hasClinicAccess) {
      throw new Error('Access denied to this clinic');
    }
    where.clinicId = clinicId;
  } else {
    where.clinicId = { in: authContext.clinicIds };
  }

  return prisma.goal.findMany({
    where,
    include: {
      metricDefinition: true,
      clinic: true,
      provider: true,
    },
    orderBy: { startDate: 'desc' },
  });
}

/**
 * Create goal from template
 */
export async function createGoalFromTemplate(
  authContext: AuthContext,
  templateId: string,
  options: {
    clinicId: string;
    providerId?: string;
    startDate: Date;
    endDate: Date;
    targetValue?: string;
  }
) {
  // Get the template
  const template = await prisma.goalTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error('Goal template not found');
  }

  // Check access to template
  if (template.clinicId && template.clinicId !== options.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, template.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this template');
    }
  }

  // Calculate target value if formula provided
  let targetValue = options.targetValue || '0';
  if (template.targetFormula && !options.targetValue) {
    targetValue = await calculateTargetFromFormula(
      template.targetFormula,
      options.clinicId,
      template.metricDefinitionId,
      options.providerId
    );
  }

  // Create goal using template
  return createGoal(authContext, {
    metricDefinitionId: template.metricDefinitionId,
    timePeriod: template.timePeriod,
    startDate: options.startDate,
    endDate: options.endDate,
    targetValue,
    clinicId: options.clinicId,
    providerId: options.providerId,
  });
}

/**
 * Calculate goal progress
 */
async function calculateGoalProgress(goal: Record<string, unknown>) {
  // Define typed properties to ensure type safety
  const clinicId = goal.clinicId as string;
  const metricDefinitionId = goal.metricDefinitionId as string;
  const providerId = goal.providerId as string | undefined;
  const startDate = goal.startDate as Date;
  const endDate = goal.endDate as Date;
  const targetValueStr = goal.targetValue as string;
  // Get actual metrics for the goal period
  const metrics = await prisma.metricValue.findMany({
    where: {
      clinicId,
      metricDefinitionId,
      providerId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      value: true,
      date: true,
    },
  });

  if (metrics.length === 0) {
    return {
      currentValue: 0,
      targetValue: Number.parseFloat(targetValueStr),
      percentage: 0,
      trend: 'neutral' as const,
      daysRemaining: Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    };
  }

  // Calculate current value based on metric type
  const values = metrics.map((m) => Number.parseFloat(m.value)).filter((v) => !Number.isNaN(v));
  const currentValue = values.reduce((acc, val) => acc + val, 0); // Sum for now, could be avg

  const targetValue = Number.parseFloat(targetValueStr);
  const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

  // Calculate trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (metrics.length >= 2) {
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'neutral';
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return {
    currentValue,
    targetValue,
    percentage: Math.min(100, Math.max(0, percentage)),
    trend,
    daysRemaining,
    metricCount: metrics.length,
  };
}

/**
 * Calculate target value from formula
 */
async function calculateTargetFromFormula(
  formula: string,
  clinicId: string,
  metricDefinitionId: string,
  providerId?: string
): Promise<string> {
  // Simple formula parser - in production would be more sophisticated
  // Example: "previous_month * 1.1" means 10% increase from previous month

  if (formula.includes('previous_month')) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const previousMetrics = await prisma.metricValue.findMany({
      where: {
        clinicId,
        metricDefinitionId,
        providerId,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      select: { value: true },
    });

    const previousSum = previousMetrics
      .map((m) => Number.parseFloat(m.value))
      .filter((v) => !Number.isNaN(v))
      .reduce((acc, val) => acc + val, 0);

    // Apply formula multiplier
    const multiplierMatch = formula.match(/\* ([\d.]+)/);
    const multiplier = multiplierMatch ? Number.parseFloat(multiplierMatch[1]) : 1;

    return String(Math.round(previousSum * multiplier));
  }

  // Default to 0 if formula not recognized
  return '0';
}

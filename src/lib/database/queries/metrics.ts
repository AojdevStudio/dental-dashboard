/**
 * Metrics Database Queries
 * Multi-tenant aware metrics operations
 */

import type { Prisma } from '@prisma/client';
import { type AuthContext, getUserClinicRole, validateClinicAccess } from '../auth-context';
import { prisma } from '../client';
import { buildClinicWhereClause } from './utils';

export interface CreateMetricInput {
  metricDefinitionId: string;
  date: Date;
  value: string;
  clinicId: string;
  providerId?: string;
  sourceType: string;
  sourceSheet?: string;
  externalId?: string;
}

export interface UpdateMetricInput {
  value?: string;
  date?: Date;
  sourceSheet?: string;
}

export interface MetricFilter {
  clinicId?: string;
  providerId?: string;
  metricDefinitionId?: string;
  dateRange?: { start: Date; end: Date };
  sourceType?: string;
}

/**
 * Get metric definitions (available to all authenticated users)
 */
export async function getMetricDefinitions(
  _authContext: AuthContext,
  options?: {
    category?: string;
    dataType?: string;
    isComposite?: boolean;
  }
) {
  const where: Prisma.MetricDefinitionWhereInput = {};

  if (options?.category) {
    where.category = options.category;
  }
  if (options?.dataType) {
    where.dataType = options.dataType;
  }
  if (options?.isComposite !== undefined) {
    where.isComposite = options.isComposite;
  }

  return prisma.metricDefinition.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

/**
 * Get metrics with multi-tenant filtering
 */
export async function getMetrics(
  authContext: AuthContext,
  filter: MetricFilter,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'date' | 'value' | 'createdAt';
    orderDir?: 'asc' | 'desc';
  }
) {
  // Build where clause with clinic access validation
  const where: Prisma.MetricValueWhereInput = {
    ...buildClinicWhereClause(authContext, filter.clinicId),
  };

  // Apply additional filters
  if (filter.providerId) {
    where.providerId = filter.providerId;
  }
  if (filter.metricDefinitionId) {
    where.metricDefinitionId = filter.metricDefinitionId;
  }
  if (filter.sourceType) {
    where.sourceType = filter.sourceType;
  }
  if (filter.dateRange) {
    where.date = {
      gte: filter.dateRange.start,
      lte: filter.dateRange.end,
    };
  }

  // Determine order by
  const orderBy: Prisma.MetricValueOrderByWithRelationInput = {};
  const orderField = options?.orderBy || 'date';
  const orderDirection = options?.orderDir || 'desc';
  orderBy[orderField] = orderDirection;

  const [metrics, total] = await Promise.all([
    prisma.metricValue.findMany({
      where,
      include: {
        metricDefinition: true,
        clinic: true,
        provider: true,
        dataSource: true,
      },
      orderBy,
      take: options?.limit,
      skip: options?.offset,
    }),
    prisma.metricValue.count({ where }),
  ]);

  return { metrics, total };
}

/**
 * Get aggregated metrics for dashboard
 */
export async function getAggregatedMetrics(
  authContext: AuthContext,
  clinicId: string,
  options: {
    metricDefinitionId?: string;
    providerId?: string;
    aggregationType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dateRange: { start: Date; end: Date };
  }
) {
  const where: Prisma.MetricAggregationWhereInput = {
    ...buildClinicWhereClause(authContext, clinicId),
    aggregationType: options.aggregationType,
    periodStart: {
      gte: options.dateRange.start,
      lte: options.dateRange.end,
    },
  };

  if (options.metricDefinitionId) {
    where.metricDefinitionId = options.metricDefinitionId;
  }
  if (options.providerId) {
    where.providerId = options.providerId;
  }

  const aggregations = await prisma.metricAggregation.findMany({
    where,
    include: {
      metricDefinition: true,
      provider: true,
    },
    orderBy: { periodStart: 'asc' },
  });

  // If no pre-computed aggregations, compute on the fly
  if (aggregations.length === 0) {
    return computeAggregations(authContext, clinicId, options);
  }

  return aggregations;
}

/**
 * Create a new metric value
 */
export async function createMetric(authContext: AuthContext, input: CreateMetricInput) {
  // Validate clinic access
  const hasAccess = await validateClinicAccess(authContext, input.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this clinic');
  }

  // Check user role - staff, provider, or admin can create metrics
  const userRole = await getUserClinicRole(authContext, input.clinicId);
  if (!userRole || userRole === 'viewer') {
    throw new Error('Insufficient permissions to create metrics');
  }

  // Validate metric definition exists
  const metricDef = await prisma.metricDefinition.findUnique({
    where: { id: input.metricDefinitionId },
  });
  if (!metricDef) {
    throw new Error('Invalid metric definition');
  }

  // Create the metric
  return prisma.metricValue.create({
    data: {
      metricDefinitionId: input.metricDefinitionId,
      date: input.date,
      value: input.value,
      clinicId: input.clinicId,
      providerId: input.providerId,
      sourceType: input.sourceType,
      sourceSheet: input.sourceSheet,
      externalId: input.externalId,
    },
    include: {
      metricDefinition: true,
      clinic: true,
      provider: true,
    },
  });
}

/**
 * Update a metric value
 */
export async function updateMetric(
  authContext: AuthContext,
  metricId: string,
  input: UpdateMetricInput
) {
  // Get the metric to check clinic access
  const metric = await prisma.metricValue.findUnique({
    where: { id: metricId },
  });

  if (!metric) {
    throw new Error('Metric not found');
  }

  // Validate clinic access
  if (metric.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, metric.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this metric');
    }

    // Check user role
    const userRole = await getUserClinicRole(authContext, metric.clinicId);
    if (!userRole || userRole === 'viewer') {
      throw new Error('Insufficient permissions to update metrics');
    }
  }

  return prisma.metricValue.update({
    where: { id: metricId },
    data: input,
    include: {
      metricDefinition: true,
      clinic: true,
      provider: true,
    },
  });
}

/**
 * Delete a metric value (clinic admin only)
 */
export async function deleteMetric(authContext: AuthContext, metricId: string) {
  // Get the metric to check clinic access
  const metric = await prisma.metricValue.findUnique({
    where: { id: metricId },
  });

  if (!metric) {
    throw new Error('Metric not found');
  }

  // Validate clinic access and admin role
  if (metric.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, metric.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this metric');
    }

    const userRole = await getUserClinicRole(authContext, metric.clinicId);
    if (userRole !== 'clinic_admin') {
      throw new Error('Only clinic administrators can delete metrics');
    }
  }

  return prisma.metricValue.delete({
    where: { id: metricId },
  });
}

/**
 * Get metric statistics for a clinic
 */
export async function getMetricStatistics(
  authContext: AuthContext,
  clinicId: string,
  metricDefinitionId: string,
  options?: {
    providerId?: string;
    dateRange?: { start: Date; end: Date };
  }
) {
  // Validate clinic access
  const hasAccess = await validateClinicAccess(authContext, clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this clinic');
  }

  const where: Prisma.MetricValueWhereInput = {
    clinicId,
    metricDefinitionId,
  };

  if (options?.providerId) {
    where.providerId = options.providerId;
  }
  if (options?.dateRange) {
    where.date = {
      gte: options.dateRange.start,
      lte: options.dateRange.end,
    };
  }

  // Get all metrics for aggregation
  const metrics = await prisma.metricValue.findMany({
    where,
    select: {
      value: true,
      date: true,
    },
    orderBy: { date: 'asc' },
  });

  if (metrics.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      avg: null,
      sum: null,
      latest: null,
    };
  }

  // Calculate statistics
  const values = metrics.map((m) => Number.parseFloat(m.value)).filter((v) => !Number.isNaN(v));
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const latest = metrics.at(-1);

  return {
    count: metrics.length,
    min,
    max,
    avg,
    sum,
    latest: latest
      ? {
          value: latest.value,
          date: latest.date,
        }
      : null,
  };
}

/**
 * Compute aggregations on the fly when pre-computed ones don't exist
 */
async function computeAggregations(
  _authContext: AuthContext,
  clinicId: string,
  options: {
    metricDefinitionId?: string;
    providerId?: string;
    aggregationType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dateRange: { start: Date; end: Date };
  }
) {
  const where: Prisma.MetricValueWhereInput = {
    clinicId,
    date: {
      gte: options.dateRange.start,
      lte: options.dateRange.end,
    },
  };

  if (options.metricDefinitionId) {
    where.metricDefinitionId = options.metricDefinitionId;
  }
  if (options.providerId) {
    where.providerId = options.providerId;
  }

  const metrics = await prisma.metricValue.findMany({
    where,
    include: {
      metricDefinition: true,
    },
    orderBy: { date: 'asc' },
  });

  // Group metrics by period
  const groupedMetrics = new Map<string, typeof metrics>();

  for (const metric of metrics) {
    const periodKey = getPeriodKey(metric.date, options.aggregationType);
    if (!groupedMetrics.has(periodKey)) {
      groupedMetrics.set(periodKey, []);
    }
    groupedMetrics.get(periodKey)?.push(metric);
  }

  // Calculate aggregations
  const aggregations = Array.from(groupedMetrics.entries()).map(([periodKey, periodMetrics]) => {
    const values = periodMetrics
      .map((m) => Number.parseFloat(m.value))
      .filter((v) => !Number.isNaN(v));
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = values.length > 0 ? sum / values.length : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    return {
      periodStart: new Date(periodKey),
      periodEnd: new Date(periodKey), // Simplified - in real implementation would calculate end
      value: sum,
      count: periodMetrics.length,
      minimum: min,
      maximum: max,
      average: avg,
      metricDefinition: periodMetrics[0]?.metricDefinition,
    };
  });

  return aggregations;
}

/**
 * Get period key for grouping metrics
 */
function getPeriodKey(date: Date, aggregationType: string): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  switch (aggregationType) {
    case 'daily':
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'weekly': {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    }
    case 'monthly':
      return `${year}-${String(month + 1).padStart(2, '0')}-01`;
    case 'quarterly': {
      const quarter = Math.floor(month / 3);
      return `${year}-${String(quarter * 3 + 1).padStart(2, '0')}-01`;
    }
    case 'yearly':
      return `${year}-01-01`;
    default:
      return date.toISOString().split('T')[0];
  }
}

/**
 * Clinic Database Queries
 * Multi-tenant aware clinic operations
 */

import { prisma } from "../client";
import { type AuthContext, validateClinicAccess, isClinicAdmin } from "../auth-context";
import type { Prisma } from "@/generated/prisma";

export interface CreateClinicInput {
  name: string;
  location: string;
  status?: string;
}

export interface UpdateClinicInput {
  name?: string;
  location?: string;
  status?: string;
}

/**
 * Get clinics accessible to the user
 */
export async function getClinics(
  authContext: AuthContext,
  options?: {
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const where: Prisma.ClinicWhereInput = {
    id: {
      in: authContext.clinicIds,
    },
  };

  if (!options?.includeInactive) {
    where.status = "active";
  }

  const [clinics, total] = await Promise.all([
    prisma.clinic.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            providers: true,
            metrics: true,
            goals: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: options?.limit,
      skip: options?.offset,
    }),
    prisma.clinic.count({ where }),
  ]);

  return { clinics, total };
}

/**
 * Get a single clinic by ID
 */
export async function getClinicById(
  authContext: AuthContext,
  clinicId: string,
  options?: {
    includeProviders?: boolean;
    includeUsers?: boolean;
    includeMetrics?: boolean;
  }
) {
  // Validate access
  const hasAccess = await validateClinicAccess(authContext, clinicId);
  if (!hasAccess) {
    throw new Error("Access denied to this clinic");
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      providers: options?.includeProviders
        ? {
            where: { status: "active" },
            orderBy: { name: "asc" },
          }
        : false,
      users: options?.includeUsers
        ? {
            orderBy: { name: "asc" },
          }
        : false,
      metrics: options?.includeMetrics
        ? {
            take: 100,
            orderBy: { createdAt: "desc" },
            include: {
              metricDefinition: true,
            },
          }
        : false,
      _count: {
        select: {
          users: true,
          providers: true,
          metrics: true,
          goals: true,
          dataSources: true,
        },
      },
    },
  });

  return clinic;
}

/**
 * Get clinic with full dashboard data
 */
export async function getClinicDashboardData(
  authContext: AuthContext,
  clinicId: string,
  dateRange?: { start: Date; end: Date }
) {
  // Validate access
  const hasAccess = await validateClinicAccess(authContext, clinicId);
  if (!hasAccess) {
    throw new Error("Access denied to this clinic");
  }

  const metricsWhere: Prisma.MetricValueWhereInput = {
    clinicId,
  };

  if (dateRange) {
    metricsWhere.date = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  const [clinic, recentMetrics, activeGoals, providers] = await Promise.all([
    // Basic clinic info
    prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        _count: {
          select: {
            users: true,
            providers: true,
          },
        },
      },
    }),

    // Recent metrics
    prisma.metricValue.findMany({
      where: metricsWhere,
      include: {
        metricDefinition: true,
        provider: true,
      },
      orderBy: { date: "desc" },
      take: 500, // Limit for performance
    }),

    // Active goals
    prisma.goal.findMany({
      where: {
        clinicId,
        endDate: { gte: new Date() },
      },
      include: {
        metricDefinition: true,
        provider: true,
      },
      orderBy: { startDate: "desc" },
    }),

    // Active providers
    prisma.provider.findMany({
      where: {
        clinicId,
        status: "active",
      },
      include: {
        _count: {
          select: {
            metrics: true,
            goals: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    clinic,
    metrics: recentMetrics,
    goals: activeGoals,
    providers,
  };
}

/**
 * Create a new clinic (super admin only)
 */
export async function createClinic(authContext: AuthContext, input: CreateClinicInput) {
  // Only system/super admins can create clinics
  if (authContext.role !== "admin" && authContext.role !== "system") {
    throw new Error("Only administrators can create clinics");
  }

  const clinic = await prisma.clinic.create({
    data: {
      name: input.name,
      location: input.location,
      status: input.status || "active",
    },
  });

  // Grant the creating user admin access to the new clinic
  if (authContext.userId !== "system") {
    await prisma.userClinicRole.create({
      data: {
        userId: authContext.userId,
        clinicId: clinic.id,
        role: "clinic_admin",
        createdBy: authContext.userId,
      },
    });
  }

  return clinic;
}

/**
 * Update clinic information (clinic admin only)
 */
export async function updateClinic(
  authContext: AuthContext,
  clinicId: string,
  input: UpdateClinicInput
) {
  // Check if user is clinic admin
  const isAdmin = await isClinicAdmin(authContext, clinicId);
  if (!isAdmin) {
    throw new Error("Only clinic administrators can update clinic information");
  }

  return prisma.clinic.update({
    where: { id: clinicId },
    data: input,
  });
}

/**
 * Get clinic statistics
 */
export async function getClinicStatistics(
  authContext: AuthContext,
  clinicId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
) {
  // Validate access
  const hasAccess = await validateClinicAccess(authContext, clinicId);
  if (!hasAccess) {
    throw new Error("Access denied to this clinic");
  }

  const dateFilter =
    options?.startDate && options?.endDate
      ? {
          date: {
            gte: options.startDate,
            lte: options.endDate,
          },
        }
      : {};

  const [userCount, providerCount, totalMetrics, activeGoals, recentActivity] = await Promise.all([
    // Active users
    prisma.userClinicRole.count({
      where: {
        clinicId,
        isActive: true,
      },
    }),

    // Active providers
    prisma.provider.count({
      where: {
        clinicId,
        status: "active",
      },
    }),

    // Total metrics in period
    prisma.metricValue.count({
      where: {
        clinicId,
        ...dateFilter,
      },
    }),

    // Active goals
    prisma.goal.count({
      where: {
        clinicId,
        endDate: { gte: new Date() },
      },
    }),

    // Recent activity (last 30 days)
    prisma.metricValue.groupBy({
      by: ["date"],
      where: {
        clinicId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _count: true,
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  return {
    users: userCount,
    providers: providerCount,
    metrics: totalMetrics,
    activeGoals,
    recentActivity: recentActivity.map((day) => ({
      date: day.date,
      count: day._count,
    })),
  };
}

/**
 * Get clinic providers with performance data
 */
export async function getClinicProviders(
  authContext: AuthContext,
  clinicId: string,
  options?: {
    includeInactive?: boolean;
    includeMetrics?: boolean;
    dateRange?: { start: Date; end: Date };
  }
) {
  // Validate access
  const hasAccess = await validateClinicAccess(authContext, clinicId);
  if (!hasAccess) {
    throw new Error("Access denied to this clinic");
  }

  const where: Prisma.ProviderWhereInput = {
    clinicId,
  };

  if (!options?.includeInactive) {
    where.status = "active";
  }

  const providers = await prisma.provider.findMany({
    where,
    include: {
      _count: {
        select: {
          metrics: options?.dateRange
            ? {
                where: {
                  date: {
                    gte: options.dateRange.start,
                    lte: options.dateRange.end,
                  },
                },
              }
            : true,
          goals: true,
        },
      },
      metrics: options?.includeMetrics
        ? {
            where: options?.dateRange
              ? {
                  date: {
                    gte: options.dateRange.start,
                    lte: options.dateRange.end,
                  },
                }
              : undefined,
            take: 10,
            orderBy: { date: "desc" },
            include: {
              metricDefinition: true,
            },
          }
        : false,
    },
    orderBy: { name: "asc" },
  });

  return providers;
}

/**
 * Search clinics by name or location
 */
export async function searchClinics(
  authContext: AuthContext,
  query: string,
  options?: {
    limit?: number;
  }
) {
  const where: Prisma.ClinicWhereInput = {
    AND: [
      {
        id: {
          in: authContext.clinicIds,
        },
      },
      {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      },
    ],
  };

  return prisma.clinic.findMany({
    where,
    take: options?.limit || 10,
    orderBy: { name: "asc" },
  });
}

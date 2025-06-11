/**
 * Google Sheets Database Queries
 * Multi-tenant aware Google Sheets operations
 */

import type { Prisma } from '@prisma/client';
import { type AuthContext, isClinicAdmin, validateClinicAccess } from '../auth-context';
import { prisma } from '../client';

export interface CreateDataSourceInput {
  name: string;
  spreadsheetId: string;
  sheetName: string;
  syncFrequency: string;
  clinicId: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: Date;
}

export interface UpdateDataSourceInput {
  name?: string;
  sheetName?: string;
  syncFrequency?: string;
  connectionStatus?: string;
  lastSyncedAt?: Date;
}

export interface CreateColumnMappingInput {
  dataSourceId: string;
  metricDefinitionId: string;
  columnName: string;
  transformationRule?: string;
}

/**
 * Get data sources for accessible clinics
 */
export async function getDataSources(
  authContext: AuthContext,
  options?: {
    clinicId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: Prisma.DataSourceWhereInput = {
    clinicId: {
      in: options?.clinicId ? [options.clinicId] : authContext.clinicIds,
    },
  };

  if (options?.clinicId) {
    const hasAccess = await validateClinicAccess(authContext, options.clinicId);
    if (!hasAccess) {
      throw new Error('Access denied to this clinic');
    }
  }

  if (options?.status) {
    where.connectionStatus = options.status;
  }

  const [dataSources, total] = await Promise.all([
    prisma.dataSource.findMany({
      where,
      include: {
        clinic: true,
        columnMappings: {
          include: {
            metricDefinition: true,
          },
        },
        _count: {
          select: {
            columnMappings: true,
            metrics: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    }),
    prisma.dataSource.count({ where }),
  ]);

  // Remove sensitive tokens from response
  const sanitizedDataSources = dataSources.map((ds) => ({
    ...ds,
    accessToken: '***',
    refreshToken: ds.refreshToken ? '***' : null,
  }));

  return { dataSources: sanitizedDataSources, total };
}

/**
 * Get a single data source
 */
export async function getDataSourceById(
  authContext: AuthContext,
  dataSourceId: string,
  options?: {
    includeToken?: boolean;
  }
) {
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: dataSourceId },
    include: {
      clinic: true,
      columnMappings: {
        include: {
          metricDefinition: true,
        },
      },
    },
  });

  if (!dataSource) {
    return null;
  }

  // Validate clinic access
  const hasAccess = await validateClinicAccess(authContext, dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this data source');
  }

  // Only clinic admins can see tokens
  if (!(options?.includeToken && (await isClinicAdmin(authContext, dataSource.clinicId)))) {
    return {
      ...dataSource,
      accessToken: '***',
      refreshToken: dataSource.refreshToken ? '***' : null,
    };
  }

  return dataSource;
}

/**
 * Create a new data source (clinic admin only)
 */
export async function createDataSource(authContext: AuthContext, input: CreateDataSourceInput) {
  // Validate clinic access and admin role
  const hasAccess = await validateClinicAccess(authContext, input.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this clinic');
  }

  const isAdmin = await isClinicAdmin(authContext, input.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can create data sources');
  }

  // Create the data source
  const dataSource = await prisma.dataSource.create({
    data: {
      ...input,
      connectionStatus: 'active',
    },
    include: {
      clinic: true,
    },
  });

  return {
    ...dataSource,
    accessToken: '***',
    refreshToken: dataSource.refreshToken ? '***' : null,
  };
}

/**
 * Update a data source (clinic admin only)
 */
export async function updateDataSource(
  authContext: AuthContext,
  dataSourceId: string,
  input: UpdateDataSourceInput
) {
  // Get the data source to check permissions
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: dataSourceId },
  });

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  // Validate clinic access and admin role
  const hasAccess = await validateClinicAccess(authContext, dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this data source');
  }

  const isAdmin = await isClinicAdmin(authContext, dataSource.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can update data sources');
  }

  const updated = await prisma.dataSource.update({
    where: { id: dataSourceId },
    data: input,
    include: {
      clinic: true,
      columnMappings: {
        include: {
          metricDefinition: true,
        },
      },
    },
  });

  return {
    ...updated,
    accessToken: '***',
    refreshToken: updated.refreshToken ? '***' : null,
  };
}

/**
 * Delete a data source (clinic admin only)
 */
export async function deleteDataSource(authContext: AuthContext, dataSourceId: string) {
  // Get the data source to check permissions
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: dataSourceId },
  });

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  // Validate clinic access and admin role
  const hasAccess = await validateClinicAccess(authContext, dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this data source');
  }

  const isAdmin = await isClinicAdmin(authContext, dataSource.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can delete data sources');
  }

  // Delete cascades to column mappings
  return prisma.dataSource.delete({
    where: { id: dataSourceId },
  });
}

/**
 * Get column mappings for a data source
 */
export async function getColumnMappings(authContext: AuthContext, dataSourceId: string) {
  // First verify access to the data source
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: dataSourceId },
    select: { clinicId: true },
  });

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  const hasAccess = await validateClinicAccess(authContext, dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this data source');
  }

  return prisma.columnMapping.findMany({
    where: { dataSourceId },
    include: {
      metricDefinition: true,
      dataSource: {
        select: {
          name: true,
          sheetName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Create a column mapping (clinic admin only)
 */
export async function createColumnMapping(
  authContext: AuthContext,
  input: CreateColumnMappingInput
) {
  // Verify access to the data source
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: input.dataSourceId },
    select: { clinicId: true },
  });

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  const hasAccess = await validateClinicAccess(authContext, dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this data source');
  }

  const isAdmin = await isClinicAdmin(authContext, dataSource.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can create column mappings');
  }

  // Verify metric definition exists
  const metricDef = await prisma.metricDefinition.findUnique({
    where: { id: input.metricDefinitionId },
  });
  if (!metricDef) {
    throw new Error('Invalid metric definition');
  }

  return prisma.columnMapping.create({
    data: input,
    include: {
      metricDefinition: true,
      dataSource: {
        select: {
          name: true,
          sheetName: true,
        },
      },
    },
  });
}

/**
 * Update a column mapping (clinic admin only)
 */
export async function updateColumnMapping(
  authContext: AuthContext,
  mappingId: string,
  input: {
    columnName?: string;
    transformationRule?: string;
  }
) {
  // Get the mapping and verify access
  const mapping = await prisma.columnMapping.findUnique({
    where: { id: mappingId },
    include: {
      dataSource: {
        select: { clinicId: true },
      },
    },
  });

  if (!mapping) {
    throw new Error('Column mapping not found');
  }

  const hasAccess = await validateClinicAccess(authContext, mapping.dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this column mapping');
  }

  const isAdmin = await isClinicAdmin(authContext, mapping.dataSource.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can update column mappings');
  }

  return prisma.columnMapping.update({
    where: { id: mappingId },
    data: input,
    include: {
      metricDefinition: true,
      dataSource: {
        select: {
          name: true,
          sheetName: true,
        },
      },
    },
  });
}

/**
 * Delete a column mapping (clinic admin only)
 */
export async function deleteColumnMapping(authContext: AuthContext, mappingId: string) {
  // Get the mapping and verify access
  const mapping = await prisma.columnMapping.findUnique({
    where: { id: mappingId },
    include: {
      dataSource: {
        select: { clinicId: true },
      },
    },
  });

  if (!mapping) {
    throw new Error('Column mapping not found');
  }

  const hasAccess = await validateClinicAccess(authContext, mapping.dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this column mapping');
  }

  const isAdmin = await isClinicAdmin(authContext, mapping.dataSource.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can delete column mappings');
  }

  return prisma.columnMapping.delete({
    where: { id: mappingId },
  });
}

/**
 * Get sync history for a data source
 */
export async function getDataSourceSyncHistory(
  authContext: AuthContext,
  dataSourceId: string,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
) {
  // Verify access to the data source
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: dataSourceId },
    select: { clinicId: true },
  });

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  const hasAccess = await validateClinicAccess(authContext, dataSource.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this data source');
  }

  const where: Prisma.MetricValueWhereInput = {
    dataSourceId,
    sourceType: 'spreadsheet',
  };

  if (options?.startDate && options?.endDate) {
    where.createdAt = {
      gte: options.startDate,
      lte: options.endDate,
    };
  }

  return prisma.metricValue.findMany({
    where,
    select: {
      id: true,
      date: true,
      createdAt: true,
      metricDefinition: {
        select: {
          name: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
  });
}

/**
 * Update Google OAuth tokens for a data source
 */
export async function updateDataSourceTokens(
  authContext: AuthContext,
  dataSourceId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiryDate?: Date;
  }
) {
  // Get the data source to check permissions
  const dataSource = await prisma.dataSource.findUnique({
    where: { id: dataSourceId },
  });

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  // Only clinic admins can update tokens
  const isAdmin = await isClinicAdmin(authContext, dataSource.clinicId);
  if (!isAdmin) {
    throw new Error('Only clinic administrators can update tokens');
  }

  return prisma.dataSource.update({
    where: { id: dataSourceId },
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || dataSource.refreshToken,
      expiryDate: tokens.expiryDate,
      connectionStatus: 'active',
      updatedAt: new Date(),
    },
  });
}

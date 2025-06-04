import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse, getPaginationParams } from "@/lib/api/utils";
import { prisma } from "@/lib/database/client";
import * as googleSheetsQueries from "@/lib/database/queries/google-sheets";
import { STANDARD_METRICS } from "@/lib/metrics/definitions";
import { NextRequest } from "next/server";
import { z } from "zod";

// Schema for create mapping request
const createMappingSchema = z.object({
  dataSourceId: z.string().uuid(),
  metricDefinitionId: z.string().uuid(),
  columnName: z.string().min(1),
  transformationRule: z.string().optional(),
});

// Schema for update mapping request
const updateMappingSchema = z.object({
  columnName: z.string().min(1).optional(),
  transformationRule: z.string().optional(),
});

// Schema for bulk mapping save
const bulkMappingSchema = z.object({
  spreadsheetId: z.string(),
  sheetName: z.string(),
  mappings: z.array(
    z.object({
      sourceColumn: z.string(),
      targetMetric: z.string(),
      transformationRule: z.string().optional(),
    })
  ),
});

export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams;
  const dataSourceId = searchParams.get("dataSourceId");

  if (!dataSourceId) {
    throw new ApiError("dataSourceId is required", 400);
  }

  const mappings = await googleSheetsQueries.getColumnMappings(authContext, dataSourceId);

  return ApiResponse.success(mappings);
});

export const POST = withAuth(
  async (request, { authContext }) => {
    // Parse and validate request body
    const body = await request.json();

    // Check if this is a bulk operation from the mapping wizard
    if (body.spreadsheetId && body.mappings) {
      const validatedData = bulkMappingSchema.parse(body);

      // Get the user's first clinic ID (TODO: handle multiple clinics)
      const clinicId = authContext.clinicIds[0];
      if (!clinicId) {
        throw new ApiError("No clinic found for user", 403);
      }

      // Start transaction for bulk operations
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create or update data source
        // First check if data source exists
        const existingDataSource = await tx.dataSource.findFirst({
          where: {
            clinicId,
            spreadsheetId: validatedData.spreadsheetId,
          },
        });

        let dataSource;
        if (existingDataSource) {
          // Update existing
          dataSource = await tx.dataSource.update({
            where: { id: existingDataSource.id },
            data: {
              sheetName: validatedData.sheetName,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new
          dataSource = await tx.dataSource.create({
            data: {
              clinicId,
              spreadsheetId: validatedData.spreadsheetId,
              name: `Google Sheet - ${validatedData.sheetName}`,
              sheetName: validatedData.sheetName,
              connectionStatus: "pending", // Will be updated when OAuth is connected
              syncFrequency: "daily",
              accessToken: "", // Will be updated when OAuth is connected
            },
          });
        }

        // 2. Ensure all metric definitions exist
        const metricNames = validatedData.mappings.map((m) => m.targetMetric);
        const existingMetrics = await tx.metricDefinition.findMany({
          where: {
            clinicId,
            name: { in: metricNames },
          },
        });

        const existingMetricNames = new Set(existingMetrics.map((m) => m.name));
        const existingMetricMap = new Map(existingMetrics.map((m) => [m.name, m.id]));

        // Create missing metric definitions
        const metricsToCreate = STANDARD_METRICS.filter(
          (metric) => metricNames.includes(metric.name) && !existingMetricNames.has(metric.name)
        ).map((metric) => ({
          clinicId,
          name: metric.name,
          description: metric.description,
          dataType: metric.dataType,
          category: metric.category,
          isComposite: metric.isComposite,
          calculationFormula: metric.calculationFormula || null,
          unit: metric.unit || null,
          isActive: true,
        }));

        if (metricsToCreate.length > 0) {
          await tx.metricDefinition.createMany({
            data: metricsToCreate,
          });

          // Fetch the newly created metrics to get their IDs
          const newMetrics = await tx.metricDefinition.findMany({
            where: {
              clinicId,
              name: { in: metricsToCreate.map((m) => m.name) },
            },
          });

          newMetrics.forEach((m) => {
            existingMetricMap.set(m.name, m.id);
          });
        }

        // 3. Delete existing column mappings for this data source
        await tx.columnMapping.deleteMany({
          where: { dataSourceId: dataSource.id },
        });

        // 4. Create new column mappings
        const columnMappings = validatedData.mappings
          .filter((mapping) => existingMetricMap.has(mapping.targetMetric))
          .map((mapping) => ({
            dataSourceId: dataSource.id,
            metricDefinitionId: existingMetricMap.get(mapping.targetMetric)!,
            columnName: mapping.sourceColumn,
            transformationRule: mapping.transformationRule || null,
          }));

        if (columnMappings.length > 0) {
          await tx.columnMapping.createMany({
            data: columnMappings,
          });
        }

        // Note: The DataSource model doesn't have a config field in the current schema
        // The column mappings are stored in the dedicated ColumnMapping table

        return {
          dataSourceId: dataSource.id,
          mappingCount: columnMappings.length,
          createdMetrics: metricsToCreate.length,
        };
      });

      return ApiResponse.success({
        success: true,
        ...result,
      });
    } else {
      // Single mapping creation
      const validatedData = createMappingSchema.parse(body);
      const mapping = await googleSheetsQueries.createColumnMapping(authContext, validatedData);
      return ApiResponse.success(mapping);
    }
  },
  {
    requireClinicAdmin: true,
  }
);

export const PUT = withAuth(
  async (request, { authContext }) => {
    const searchParams = request.nextUrl.searchParams;
    const mappingId = searchParams.get("mappingId");

    if (!mappingId) {
      throw new ApiError("mappingId is required", 400);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateMappingSchema.parse(body);

    const mapping = await googleSheetsQueries.updateColumnMapping(
      authContext,
      mappingId,
      validatedData
    );

    return ApiResponse.success(mapping);
  },
  {
    requireClinicAdmin: true,
  }
);

export const DELETE = withAuth(
  async (request, { authContext }) => {
    const searchParams = request.nextUrl.searchParams;
    const mappingId = searchParams.get("mappingId");

    if (!mappingId) {
      throw new ApiError("mappingId is required", 400);
    }

    await googleSheetsQueries.deleteColumnMapping(authContext, mappingId);

    return ApiResponse.success({ success: true });
  },
  {
    requireClinicAdmin: true,
  }
);

// Export types for client-side usage
export type CreateMappingInput = z.infer<typeof createMappingSchema>;
export type UpdateMappingInput = z.infer<typeof updateMappingSchema>;
export type ColumnMapping = Awaited<ReturnType<typeof googleSheetsQueries.getColumnMappings>>[0];

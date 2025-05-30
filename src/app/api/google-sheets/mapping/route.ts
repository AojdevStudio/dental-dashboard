import { NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse, getPaginationParams } from "@/lib/api/utils";
import * as googleSheetsQueries from "@/lib/database/queries/google-sheets";

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
    const validatedData = createMappingSchema.parse(body);

    const mapping = await googleSheetsQueries.createColumnMapping(authContext, validatedData);

    return ApiResponse.success(mapping);
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

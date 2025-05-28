import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/api/middleware'
import { ApiError, ApiResponse } from '@/lib/api/utils'
import * as googleSheetsQueries from '@/lib/database/queries/google-sheets'

// Schema for validate request
const validateSchema = z.object({
  dataSourceId: z.string().uuid(),
  sampleSize: z.number().min(1).max(100).optional().default(10),
})

export const POST = withAuth(async (request, { authContext }) => {
  // Parse and validate request body
  const body = await request.json()
  const { dataSourceId, sampleSize } = validateSchema.parse(body)

  // Verify access to the data source
  const dataSource = await googleSheetsQueries.getDataSourceById(
    authContext,
    dataSourceId
  )

  if (!dataSource) {
    throw new ApiError('Data source not found', 404)
  }

  // Get column mappings
  const mappings = await googleSheetsQueries.getColumnMappings(
    authContext,
    dataSourceId
  )

  // TODO: Implement actual validation with Google Sheets API
  // For now, return mock validation results
  const mockValidationResults = {
    isValid: true,
    sampleSize,
    errors: [],
    warnings: [
      {
        column: 'Production',
        row: 5,
        message: 'Value appears to be formatted as text instead of number',
      },
    ],
    statistics: {
      totalRows: 250,
      validRows: 248,
      invalidRows: 2,
      mappedColumns: mappings.length,
      unmappedColumns: 3,
    },
    sampleData: [
      {
        row: 1,
        data: {
          Date: '2024-01-15',
          Provider: 'Dr. Smith',
          Production: '5250.00',
          Collections: '4800.00',
        },
      },
      {
        row: 2,
        data: {
          Date: '2024-01-16',
          Provider: 'Dr. Johnson',
          Production: '3200.00',
          Collections: '3200.00',
        },
      },
    ],
  }

  return ApiResponse.success({
    dataSource: {
      id: dataSource.id,
      name: dataSource.name,
      sheetName: dataSource.sheetName,
    },
    validation: mockValidationResults,
    mappings: mappings.map(m => ({
      id: m.id,
      columnName: m.columnName,
      metricName: m.metricDefinition.name,
      transformationRule: m.transformationRule,
    })),
  })
}, {
  requireClinicAdmin: true,
})

// Export types for client-side usage
export type ValidateRequest = z.infer<typeof validateSchema>
export type ValidateResponse = {
  dataSource: {
    id: string
    name: string
    sheetName: string
  }
  validation: {
    isValid: boolean
    sampleSize: number
    errors: Array<{ column: string; row: number; message: string }>
    warnings: Array<{ column: string; row: number; message: string }>
    statistics: {
      totalRows: number
      validRows: number
      invalidRows: number
      mappedColumns: number
      unmappedColumns: number
    }
    sampleData: Array<{ row: number; data: Record<string, any> }>
  }
  mappings: Array<{
    id: string
    columnName: string
    metricName: string
    transformationRule: string | null
  }>
}
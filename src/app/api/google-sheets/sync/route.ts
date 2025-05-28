import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/api/middleware'
import { ApiError, ApiResponse } from '@/lib/api/utils'
import * as googleSheetsQueries from '@/lib/database/queries/google-sheets'

// Schema for sync request
const syncSchema = z.object({
  dataSourceId: z.string().uuid(),
  forceSync: z.boolean().optional().default(false),
})

export const POST = withAuth(async (request, { authContext }) => {
  // Parse and validate request body
  const body = await request.json()
  const { dataSourceId, forceSync } = syncSchema.parse(body)

  // Verify access to the data source
  const dataSource = await googleSheetsQueries.getDataSourceById(
    authContext,
    dataSourceId,
    { includeToken: true } // Need token for sync
  )

  if (!dataSource) {
    throw new ApiError('Data source not found', 404)
  }

  // Check if sync is already in progress (unless forced)
  if (!forceSync && dataSource.connectionStatus === 'syncing') {
    throw new ApiError('Sync already in progress', 409)
  }

  // TODO: Implement actual Google Sheets sync
  // For now, just update the last synced timestamp
  const updatedDataSource = await googleSheetsQueries.updateDataSource(
    authContext,
    dataSourceId,
    {
      lastSyncedAt: new Date(),
      connectionStatus: 'active',
    }
  )

  // Get sync history
  const syncHistory = await googleSheetsQueries.getDataSourceSyncHistory(
    authContext,
    dataSourceId,
    { limit: 10 }
  )

  return ApiResponse.success({
    dataSource: updatedDataSource,
    syncHistory,
    syncedAt: new Date().toISOString(),
    recordsProcessed: 0, // TODO: Implement actual count
    errors: [],
  })
}, {
  requireClinicAdmin: true,
})

// Export types for client-side usage
export type SyncRequest = z.infer<typeof syncSchema>
export type SyncResponse = {
  dataSource: Awaited<ReturnType<typeof googleSheetsQueries.updateDataSource>>
  syncHistory: Awaited<ReturnType<typeof googleSheetsQueries.getDataSourceSyncHistory>>
  syncedAt: string
  recordsProcessed: number
  errors: Array<{ row: number; error: string }>
}
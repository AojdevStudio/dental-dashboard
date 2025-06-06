import prisma from '@/lib/database/client'
import type { Prisma } from '@/src/generated/prisma'

export interface LocationWithMetrics {
  id: string
  name: string
  address: string | null
  isActive: boolean
  clinic: {
    id: string
    name: string
  }
  providers: {
    id: string
    name: string
    providerType: string
    isPrimary: boolean
  }[]
  financialSummary: {
    totalRecords: number
    totalProduction: number
    avgProduction: number
    lastRecordDate: Date | null
  }
  _count: {
    providers: number
    financials: number
  }
}

export interface LocationFinancialSummary {
  locationId: string
  locationName: string
  clinicId: string
  clinicName: string
  periodStart: Date
  periodEnd: Date
  totalProduction: number
  totalAdjustments: number
  totalWriteOffs: number
  totalNetProduction: number
  totalCollections: number
  avgDailyProduction: number
  recordCount: number
  lastSyncDate: Date | null
}

/**
 * Get all locations with comprehensive metrics
 */
export async function getLocationsWithMetrics(params?: {
  clinicId?: string
  includeInactive?: boolean
}): Promise<LocationWithMetrics[]> {
  const { clinicId, includeInactive = false } = params || {}

  const whereClause: Prisma.LocationWhereInput = {}
  
  if (clinicId) {
    whereClause.clinicId = clinicId
  }
  
  if (!includeInactive) {
    whereClause.isActive = true
  }

  const locations = await prisma.location.findMany({
    where: whereClause,
    include: {
      clinic: {
        select: {
          id: true,
          name: true
        }
      },
      providers: {
        where: {
          isActive: true
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true,
              status: true
            }
          }
        },
        orderBy: [
          { isPrimary: 'desc' },
          { provider: { name: 'asc' } }
        ]
      },
      _count: {
        select: {
          providers: {
            where: { isActive: true }
          },
          financials: true
        }
      }
    },
    orderBy: [
      { clinic: { name: 'asc' } },
      { name: 'asc' }
    ]
  })

  // Get financial summaries for each location
  const locationsWithMetrics = await Promise.all(
    locations.map(async (location) => {
      const financialSummary = await prisma.locationFinancial.aggregate({
        where: {
          locationId: location.id
        },
        _sum: {
          production: true
        },
        _avg: {
          production: true
        },
        _count: {
          id: true
        }
      })

      const lastRecord = await prisma.locationFinancial.findFirst({
        where: {
          locationId: location.id
        },
        orderBy: {
          date: 'desc'
        },
        select: {
          date: true
        }
      })

      return {
        id: location.id,
        name: location.name,
        address: location.address,
        isActive: location.isActive,
        clinic: location.clinic,
        providers: location.providers.map(pl => ({
          id: pl.provider.id,
          name: pl.provider.name,
          providerType: pl.provider.providerType,
          isPrimary: pl.isPrimary
        })),
        financialSummary: {
          totalRecords: financialSummary._count.id,
          totalProduction: financialSummary._sum.production?.toNumber() || 0,
          avgProduction: financialSummary._avg.production?.toNumber() || 0,
          lastRecordDate: lastRecord?.date || null
        },
        _count: location._count
      }
    })
  )

  return locationsWithMetrics
}

/**
 * Get financial summary for locations over a date range
 */
export async function getLocationFinancialSummary(params: {
  locationIds?: string[]
  clinicId?: string
  startDate: Date
  endDate: Date
}): Promise<LocationFinancialSummary[]> {
  const { locationIds, clinicId, startDate, endDate } = params

  const whereConditions: string[] = []
  const values: any[] = []

  // Build WHERE clause
  whereConditions.push(`lf.date >= $${values.length + 1}`)
  values.push(startDate)
  
  whereConditions.push(`lf.date <= $${values.length + 1}`)
  values.push(endDate)

  if (clinicId) {
    whereConditions.push(`lf.clinic_id = $${values.length + 1}`)
    values.push(clinicId)
  }

  if (locationIds && locationIds.length > 0) {
    const placeholders = locationIds.map((_, index) => `$${values.length + index + 1}`).join(', ')
    whereConditions.push(`lf.location_id IN (${placeholders})`)
    values.push(...locationIds)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const query = `
    SELECT 
      l.id as location_id,
      l.name as location_name,
      c.id as clinic_id,
      c.name as clinic_name,
      $${values.length + 1} as period_start,
      $${values.length + 2} as period_end,
      COALESCE(SUM(lf.production), 0) as total_production,
      COALESCE(SUM(lf.adjustments), 0) as total_adjustments,
      COALESCE(SUM(lf.write_offs), 0) as total_write_offs,
      COALESCE(SUM(lf.net_production), 0) as total_net_production,
      COALESCE(SUM(lf.total_collections), 0) as total_collections,
      COALESCE(AVG(lf.production), 0) as avg_daily_production,
      COUNT(lf.id) as record_count,
      MAX(ds.last_synced_at) as last_sync_date
    FROM locations l
    JOIN clinics c ON l.clinic_id = c.id
    LEFT JOIN location_financial lf ON l.id = lf.location_id
    LEFT JOIN data_sources ds ON lf.data_source_id = ds.id
    ${whereClause}
    GROUP BY l.id, l.name, c.id, c.name
    ORDER BY c.name, l.name
  `

  values.push(startDate, endDate)

  try {
    const results = await prisma.$queryRawUnsafe(query, ...values) as any[]

    return results.map(row => ({
      locationId: row.location_id,
      locationName: row.location_name,
      clinicId: row.clinic_id,
      clinicName: row.clinic_name,
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      totalProduction: Number.parseFloat(row.total_production || '0'),
      totalAdjustments: Number.parseFloat(row.total_adjustments || '0'),
      totalWriteOffs: Number.parseFloat(row.total_write_offs || '0'),
      totalNetProduction: Number.parseFloat(row.total_net_production || '0'),
      totalCollections: Number.parseFloat(row.total_collections || '0'),
      avgDailyProduction: Number.parseFloat(row.avg_daily_production || '0'),
      recordCount: Number.parseInt(row.record_count || '0'),
      lastSyncDate: row.last_sync_date ? new Date(row.last_sync_date) : null
    }))

  } catch (error) {
    console.error('Error fetching location financial summary:', error)
    throw error
  }
}

/**
 * Get location details with recent financial data
 */
export async function getLocationWithRecentData(locationId: string, days = 30) {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: {
      clinic: {
        select: {
          id: true,
          name: true
        }
      },
      providers: {
        where: {
          isActive: true
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true
            }
          }
        }
      }
    }
  })

  if (!location) {
    return null
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const recentFinancials = await prisma.locationFinancial.findMany({
    where: {
      locationId,
      date: {
        gte: cutoffDate
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 50
  })

  return {
    ...location,
    recentFinancials
  }
}

/**
 * Get top performing locations by production
 */
export async function getTopPerformingLocations(params: {
  clinicId?: string
  startDate: Date
  endDate: Date
  limit?: number
}) {
  const { clinicId, startDate, endDate, limit = 10 } = params

  const whereConditions: string[] = []
  const values: any[] = []

  whereConditions.push(`lf.date >= $${values.length + 1}`)
  values.push(startDate)
  
  whereConditions.push(`lf.date <= $${values.length + 1}`)
  values.push(endDate)

  if (clinicId) {
    whereConditions.push(`lf.clinic_id = $${values.length + 1}`)
    values.push(clinicId)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const query = `
    SELECT 
      l.id,
      l.name,
      l.address,
      c.name as clinic_name,
      SUM(lf.production) as total_production,
      SUM(lf.net_production) as total_net_production,
      SUM(lf.total_collections) as total_collections,
      AVG(lf.production) as avg_daily_production,
      COUNT(lf.id) as production_days,
      COUNT(DISTINCT pl.provider_id) as provider_count
    FROM locations l
    JOIN clinics c ON l.clinic_id = c.id
    LEFT JOIN location_financial lf ON l.id = lf.location_id
    LEFT JOIN provider_locations pl ON l.id = pl.location_id AND pl.is_active = true
    ${whereClause}
    GROUP BY l.id, l.name, l.address, c.name
    HAVING SUM(lf.production) > 0
    ORDER BY total_production DESC
    LIMIT $${values.length + 1}
  `

  values.push(limit)

  try {
    const results = await prisma.$queryRawUnsafe(query, ...values) as any[]

    return results.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      clinicName: row.clinic_name,
      totalProduction: Number.parseFloat(row.total_production || '0'),
      totalNetProduction: Number.parseFloat(row.total_net_production || '0'),
      totalCollections: Number.parseFloat(row.total_collections || '0'),
      avgDailyProduction: Number.parseFloat(row.avg_daily_production || '0'),
      productionDays: Number.parseInt(row.production_days || '0'),
      providerCount: Number.parseInt(row.provider_count || '0')
    }))

  } catch (error) {
    console.error('Error fetching top performing locations:', error)
    throw error
  }
}

/**
 * Get location performance comparison
 */
export async function getLocationPerformanceComparison(params: {
  locationIds: string[]
  startDate: Date
  endDate: Date
}) {
  const summaries = await getLocationFinancialSummary(params)
  
  // Calculate benchmarks
  const totalProductions = summaries.map(s => s.totalProduction).filter(p => p > 0)
  const avgProductions = summaries.map(s => s.avgDailyProduction).filter(p => p > 0)
  
  const benchmarks = {
    avgTotalProduction: totalProductions.reduce((a, b) => a + b, 0) / totalProductions.length || 0,
    avgDailyProduction: avgProductions.reduce((a, b) => a + b, 0) / avgProductions.length || 0,
    maxTotalProduction: Math.max(...totalProductions, 0),
    minTotalProduction: Math.min(...totalProductions, Number.POSITIVE_INFINITY) || 0
  }

  return {
    locations: summaries.map(summary => ({
      ...summary,
      performanceMetrics: {
        totalProductionRank: totalProductions.filter(p => p > summary.totalProduction).length + 1,
        totalProductionPercentile: ((totalProductions.filter(p => p <= summary.totalProduction).length) / totalProductions.length) * 100,
        avgProductionVsBenchmark: summary.avgDailyProduction / benchmarks.avgDailyProduction,
        totalProductionVsBenchmark: summary.totalProduction / benchmarks.avgTotalProduction
      }
    })),
    benchmarks
  }
}
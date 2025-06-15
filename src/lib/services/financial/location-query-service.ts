import { prisma } from '@/lib/database/client';

export interface LocationFinancialQueryParams {
  clinicId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  groupBy?: 'day' | 'week' | 'month';
}

type LocationFinancialWhereInput = {
  clinicId?: string;
  locationId?: string;
  date?: {
    gte?: Date;
    lte?: Date;
  };
};

type AggregatedFinancialItem = {
  period: Date;
  clinic_id: string;
  location_id: string;
  total_production: string | null;
  total_adjustments: string | null;
  total_write_offs: string | null;
  total_net_production: string | null;
  total_patient_income: string | null;
  total_insurance_income: string | null;
  total_collections: string | null;
  avg_unearned: string | null;
  record_count: bigint;
};

export class LocationFinancialQueryService {
  buildWhereClause(params: LocationFinancialQueryParams): LocationFinancialWhereInput {
    const where: LocationFinancialWhereInput = {};

    if (params.clinicId) {
      where.clinicId = params.clinicId;
    }

    if (params.locationId) {
      where.locationId = params.locationId;
    }

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.date.lte = new Date(params.endDate);
      }
    }

    return where;
  }

  async getAggregatedData(params: LocationFinancialQueryParams) {
    const where = this.buildWhereClause(params);
    const offset = (params.page - 1) * params.limit;

    // Get date grouping SQL
    const dateGrouping = this.getDateGroupingSql(params.groupBy);

    // Build query with parameters
    const { query, queryParams } = this.buildAggregatedQuery(
      where,
      dateGrouping,
      params.limit,
      offset
    );

    const aggregatedData = (await prisma.$queryRawUnsafe(
      query,
      ...queryParams
    )) as AggregatedFinancialItem[];

    // Enrich with clinic and location details
    const enrichedData = await this.enrichAggregatedData(aggregatedData);

    return {
      data: enrichedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        hasMore: enrichedData.length === params.limit,
      },
      groupBy: params.groupBy,
    };
  }

  async getDetailedData(params: LocationFinancialQueryParams) {
    const where = this.buildWhereClause(params);
    const offset = (params.page - 1) * params.limit;

    const baseOptions = {
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        dataSource: {
          select: {
            id: true,
            name: true,
            lastSyncedAt: true,
          },
        },
      },
    };

    const [data, total] = await Promise.all([
      prisma.locationFinancial.findMany({
        ...baseOptions,
        orderBy: { date: 'desc' },
        skip: offset,
        take: params.limit,
      }),
      prisma.locationFinancial.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
        hasMore: offset + data.length < total,
      },
    };
  }

  private getDateGroupingSql(groupBy?: string): string {
    switch (groupBy) {
      case 'week':
        return `DATE_TRUNC('week', date)`;
      case 'month':
        return `DATE_TRUNC('month', date)`;
      default:
        return `DATE_TRUNC('day', date)`;
    }
  }

  private buildAggregatedQuery(
    where: LocationFinancialWhereInput,
    dateGrouping: string,
    limit: number,
    offset: number
  ): { query: string; queryParams: Array<string | Date | number> } {
    const conditions: string[] = [];
    const params: Array<string | Date | number> = [];

    if (where.clinicId) {
      conditions.push(`clinic_id = $${params.length + 1}`);
      params.push(where.clinicId);
    }

    if (where.locationId) {
      conditions.push(`location_id = $${params.length + 1}`);
      params.push(where.locationId);
    }

    if (where.date?.gte) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(where.date.gte);
    }

    if (where.date?.lte) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(where.date.lte);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        ${dateGrouping} as period,
        clinic_id,
        location_id,
        SUM(production) as total_production,
        SUM(adjustments) as total_adjustments,
        SUM(write_offs) as total_write_offs,
        SUM(net_production) as total_net_production,
        SUM(patient_income) as total_patient_income,
        SUM(insurance_income) as total_insurance_income,
        SUM(total_collections) as total_collections,
        AVG(unearned) as avg_unearned,
        COUNT(*) as record_count
      FROM location_financial 
      ${whereClause}
      GROUP BY period, clinic_id, location_id
      ORDER BY period DESC, clinic_id, location_id
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    return { query, queryParams: params };
  }

  private async enrichAggregatedData(aggregatedData: AggregatedFinancialItem[]) {
    return await Promise.all(
      aggregatedData.map(async (item) => {
        const [clinic, location] = await Promise.all([
          prisma.clinic.findUnique({
            where: { id: item.clinic_id },
            select: { id: true, name: true },
          }),
          prisma.location.findUnique({
            where: { id: item.location_id },
            select: { id: true, name: true, address: true },
          }),
        ]);

        return {
          period: item.period,
          clinic,
          location,
          metrics: {
            totalProduction: Number.parseFloat(item.total_production || '0'),
            totalAdjustments: Number.parseFloat(item.total_adjustments || '0'),
            totalWriteOffs: Number.parseFloat(item.total_write_offs || '0'),
            totalNetProduction: Number.parseFloat(item.total_net_production || '0'),
            totalPatientIncome: Number.parseFloat(item.total_patient_income || '0'),
            totalInsuranceIncome: Number.parseFloat(item.total_insurance_income || '0'),
            totalCollections: Number.parseFloat(item.total_collections || '0'),
            avgUnearned: Number.parseFloat(item.avg_unearned || '0'),
            recordCount: Number.parseInt(item.record_count.toString() || '0'),
          },
        };
      })
    );
  }
}

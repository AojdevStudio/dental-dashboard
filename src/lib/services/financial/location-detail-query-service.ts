import { prisma } from '@/lib/database/client';

export interface LocationDetailQueryParams {
  locationId: string;
  startDate?: string;
  endDate?: string;
  summary?: boolean;
}

interface DateFilter {
  gte?: Date;
  lte?: Date;
}

export class LocationDetailQueryService {
  async getLocationDetails(params: LocationDetailQueryParams) {
    // Verify location exists
    const location = await this.verifyLocation(params.locationId);

    // Build date filter
    const dateFilter = this.buildDateFilter(params.startDate, params.endDate);

    // Build where clause
    const where = {
      locationId: params.locationId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    if (params.summary) {
      return this.getSummaryData(where, location);
    }
    return this.getDetailedData(where, location);
  }

  private async verifyLocation(locationId: string) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  }

  private buildDateFilter(startDate?: string, endDate?: string): DateFilter {
    const dateFilter: DateFilter = {};

    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    return dateFilter;
  }

  private async getSummaryData(where: any, location: any) {
    const [recentRecords, totals, dateRange] = await Promise.all([
      this.getRecentRecords(where),
      this.getAggregates(where),
      this.getDateRange(where.locationId, where.date),
    ]);

    return {
      location,
      summary: {
        dateRange: {
          start: dateRange?.min_date,
          end: dateRange?.max_date,
        },
        totals: {
          records: totals._count.id,
          totalProduction: totals._sum.production || 0,
          totalAdjustments: totals._sum.adjustments || 0,
          totalWriteOffs: totals._sum.writeOffs || 0,
          totalNetProduction: totals._sum.netProduction || 0,
          totalPatientIncome: totals._sum.patientIncome || 0,
          totalInsuranceIncome: totals._sum.insuranceIncome || 0,
          totalCollections: totals._sum.totalCollections || 0,
        },
        averages: {
          avgProduction: totals._avg.production || 0,
          avgNetProduction: totals._avg.netProduction || 0,
          avgCollections: totals._avg.totalCollections || 0,
        },
      },
      recentRecords,
    };
  }

  private async getDetailedData(where: any, location: any) {
    const financialData = await prisma.locationFinancial.findMany({
      where,
      include: {
        dataSource: {
          select: {
            id: true,
            name: true,
            lastSyncedAt: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return {
      location,
      financialData,
    };
  }

  private async getRecentRecords(where: any) {
    return prisma.locationFinancial.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 10,
      select: {
        date: true,
        production: true,
        netProduction: true,
        totalCollections: true,
      },
    });
  }

  private async getAggregates(where: any) {
    return prisma.locationFinancial.aggregate({
      where,
      _sum: {
        production: true,
        adjustments: true,
        writeOffs: true,
        netProduction: true,
        patientIncome: true,
        insuranceIncome: true,
        totalCollections: true,
      },
      _avg: {
        production: true,
        netProduction: true,
        totalCollections: true,
      },
      _count: {
        id: true,
      },
    });
  }

  private async getDateRange(locationId: string, dateFilter?: DateFilter) {
    const conditions: string[] = ['location_id = $1'];
    const params: any[] = [locationId];

    if (dateFilter?.gte) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(dateFilter.gte);
    }

    if (dateFilter?.lte) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(dateFilter.lte);
    }

    const whereClause = conditions.join(' AND ');

    const [dateRange] = await prisma.$queryRawUnsafe<[{ min_date: Date; max_date: Date }]>(
      `
      SELECT 
        MIN(date) as min_date,
        MAX(date) as max_date
      FROM location_financial 
      WHERE ${whereClause}
    `,
      ...params
    );

    return dateRange;
  }
}

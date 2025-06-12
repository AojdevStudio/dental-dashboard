import { LocationFinancialCreateService } from '@/lib/services/financial/location-create-service';
import { LocationFinancialQueryService } from '@/lib/services/financial/location-query-service';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryService = new LocationFinancialQueryService();
    const params = {
      clinicId: searchParams.get('clinicId') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: Number.parseInt(searchParams.get('page') || '1'),
      limit: Number.parseInt(searchParams.get('limit') || '50'),
      groupBy: searchParams.get('groupBy') as 'day' | 'week' | 'month' | undefined,
    };

    const result = params.groupBy
      ? await queryService.getAggregatedData(params)
      : await queryService.getDetailedData(params);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch location financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const createService = new LocationFinancialCreateService();

    const financialRecord = await createService.create(body);

    return NextResponse.json(
      {
        success: true,
        data: financialRecord,
        message: 'Financial data created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    const statusCode =
      error instanceof Error && error.message.includes('not found')
        ? 404
        : error instanceof Error && error.message.includes('already exists')
          ? 409
          : 400;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create location financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: statusCode }
    );
  }
}

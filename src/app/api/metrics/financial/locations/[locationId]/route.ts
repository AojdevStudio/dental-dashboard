import { prisma } from '@/lib/database/client';
import { LocationDetailQueryService } from '@/lib/services/financial/location-detail-query-service';
import { FinancialUpdateStrategyFactory } from '@/lib/services/financial/update-strategies';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;
    const { searchParams } = new URL(request.url);

    const queryService = new LocationDetailQueryService();
    const queryParams = {
      locationId,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      summary: searchParams.get('summary') === 'true',
    };

    const data = await queryService.getLocationDetails(queryParams);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message === 'Location not found' ? 404 : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch location financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: statusCode }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;
    const body = await request.json();

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location not found',
        },
        { status: 404 }
      );
    }

    // Create update context
    const context = {
      locationId,
      clinicId: location.clinicId,
    };

    // Create and execute update strategy
    const strategy = FinancialUpdateStrategyFactory.createStrategy(body);
    const result = await strategy.update(body, context);

    return NextResponse.json({
      success: true,
      data: result.record,
      message: 'Financial data updated successfully',
      wasCreated: result.wasCreated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update location financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

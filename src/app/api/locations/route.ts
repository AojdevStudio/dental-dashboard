import { prisma } from '@/lib/database/client';
import type { Prisma } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause
    const where: Prisma.LocationWhereInput = {};

    if (clinicId) {
      where.clinicId = clinicId;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        providers: {
          where: {
            isActive: true,
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                providerType: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            providers: true,
            financials: true,
          },
        },
      },
      orderBy: [{ clinic: { name: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: locations,
      count: locations.length,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch locations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinicId, name, address, isActive = true } = body;

    // Validate required fields
    if (!clinicId || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: clinicId and name are required',
        },
        { status: 400 }
      );
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Clinic not found',
        },
        { status: 404 }
      );
    }

    // Check for duplicate location name within clinic
    const existingLocation = await prisma.location.findFirst({
      where: {
        clinicId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingLocation) {
      return NextResponse.json(
        {
          success: false,
          error: 'A location with this name already exists for this clinic',
        },
        { status: 409 }
      );
    }

    // Create the location
    const location = await prisma.location.create({
      data: {
        clinicId,
        name: name.trim(),
        address: address?.trim(),
        isActive,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: location,
        message: 'Location created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create location',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

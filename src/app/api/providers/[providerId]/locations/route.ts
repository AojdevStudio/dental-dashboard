import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/database/client";
import { type NextRequest, NextResponse } from "next/server";

interface ProviderLocationWhereInput {
  providerId: string;
  isActive?: boolean;
}

interface ProviderLocationUpdateData {
  isPrimary?: boolean;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date | null;
}

export async function GET(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const { providerId } = params;
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { id: true, name: true },
    });

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: "Provider not found",
        },
        { status: 404 }
      );
    }

    // Get provider locations
    const where: ProviderLocationWhereInput = { providerId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const providerLocations = await prisma.providerLocation.findMany({
      where,
      include: {
        location: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPrimary: "desc" }, // Primary locations first
        { location: { name: "asc" } },
      ],
    });

    const locations = providerLocations.map((pl) => ({
      id: pl.id,
      locationId: pl.location.id,
      locationName: pl.location.name,
      locationAddress: pl.location.address,
      clinicId: pl.location.clinic.id,
      clinicName: pl.location.clinic.name,
      isPrimary: pl.isPrimary,
      isActive: pl.isActive,
      startDate: pl.startDate,
      endDate: pl.endDate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        provider,
        locations,
        totalLocations: locations.length,
        primaryLocation: locations.find((l) => l.isPrimary),
      },
    });
  } catch (error) {
    console.error("Error fetching provider locations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch provider locations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const { providerId } = params;
    const body = await request.json();
    const { locationId, isPrimary = false, isActive = true, startDate, endDate } = body;

    // Validate required fields
    if (!locationId) {
      return NextResponse.json(
        {
          success: false,
          error: "locationId is required",
        },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: "Provider not found",
        },
        { status: 404 }
      );
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
        },
        { status: 404 }
      );
    }

    // Check if relationship already exists
    const existingRelation = await prisma.providerLocation.findUnique({
      where: {
        providerId_locationId: {
          providerId,
          locationId,
        },
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        {
          success: false,
          error: "Provider is already assigned to this location",
        },
        { status: 409 }
      );
    }

    // If setting as primary, update other locations to not be primary
    if (isPrimary) {
      await prisma.providerLocation.updateMany({
        where: {
          providerId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create the provider-location relationship
    const providerLocation = await prisma.providerLocation.create({
      data: {
        providerId,
        locationId,
        isPrimary,
        isActive,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        location: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        provider: {
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
        data: providerLocation,
        message: "Provider-location relationship created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating provider-location relationship:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create provider-location relationship",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const { providerId } = params;
    const body = await request.json();
    const { relationshipId, isPrimary, isActive, startDate, endDate } = body;

    // Validate required fields
    if (!relationshipId) {
      return NextResponse.json(
        {
          success: false,
          error: "relationshipId is required",
        },
        { status: 400 }
      );
    }

    // Verify relationship exists and belongs to this provider
    const existingRelation = await prisma.providerLocation.findFirst({
      where: {
        id: relationshipId,
        providerId,
      },
    });

    if (!existingRelation) {
      return NextResponse.json(
        {
          success: false,
          error: "Provider-location relationship not found",
        },
        { status: 404 }
      );
    }

    // If setting as primary, update other locations to not be primary
    if (isPrimary === true && !existingRelation.isPrimary) {
      await prisma.providerLocation.updateMany({
        where: {
          providerId,
          isPrimary: true,
          id: { not: relationshipId },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Build update data
    const updateData: ProviderLocationUpdateData = {};
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    // Update the relationship
    const updatedRelation = await prisma.providerLocation.update({
      where: { id: relationshipId },
      data: updateData,
      include: {
        location: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRelation,
      message: "Provider-location relationship updated successfully",
    });
  } catch (error) {
    console.error("Error updating provider-location relationship:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update provider-location relationship",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

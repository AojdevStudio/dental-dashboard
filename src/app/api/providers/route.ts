import { prisma } from "@/lib/database/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, first_name, last_name, email, provider_type, position, clinic_id } = body;

    // Validate required fields
    if (!name || !clinic_id) {
      return NextResponse.json({ error: "Name and clinic_id are required" }, { status: 400 });
    }

    // Create the provider
    const provider = await prisma.provider.create({
      data: {
        name,
        firstName: first_name,
        lastName: last_name,
        email,
        providerType: provider_type || "other",
        position,
        status: "active",
        clinicId: clinic_id,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A provider with this information already exists" },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json({ error: "Invalid clinic_id provided" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}

import { getProvidersWithLocations } from "@/lib/database/queries/providers";
import { apiError, apiPaginated, getPaginationParams, handleApiError } from "@/lib/api/utils";
import { withAuth, type ApiHandler } from "@/lib/api/middleware";
import type { AuthContext } from "@/lib/database/auth-context";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Query parameter validation schema
const providersQuerySchema = z.object({
  clinicId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  providerType: z.enum(["dentist", "hygienist", "specialist", "other"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  includeInactive: z.string().transform(val => val === "true").optional(),
  page: z.string().transform(val => Math.max(1, Number.parseInt(val) || 1)).optional(),
  limit: z.string().transform(val => Math.min(100, Math.max(1, Number.parseInt(val) || 10))).optional(),
});

async function getProvidersHandler(
  request: NextRequest,
  { authContext }: { authContext: AuthContext }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate query parameters
    const queryParams = providersQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const { page = 1, limit = 10, ...filterParams } = queryParams;

    // Apply multi-tenant filtering - providers can only see providers from their clinic
    const filters = {
      ...filterParams,
      clinicId: filterParams.clinicId || authContext.clinicId,
    };

    // Fetch providers with locations
    const providers = await getProvidersWithLocations(filters);

    // Simple pagination (since getProvidersWithLocations doesn't support offset)
    const offset = (page - 1) * limit;
    const paginatedProviders = providers.slice(offset, offset + limit);
    const total = providers.length;

    return apiPaginated(paginatedProviders, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getProvidersHandler);

// Create provider request schema
const createProviderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  provider_type: z.enum(["dentist", "hygienist", "specialist", "other"]).default("other"),
  position: z.string().optional(),
  clinic_id: z.string().uuid("Invalid clinic ID format"),
});

async function createProviderHandler(
  request: NextRequest,
  { authContext }: { authContext: AuthContext }
) {
  try {
    const body = await request.json();
    const validatedData = createProviderSchema.parse(body);

    // Ensure user can only create providers for their clinic (unless admin)
    const clinicId = validatedData.clinic_id;
    if (authContext.role !== "admin" && authContext.clinicId !== clinicId) {
      return apiError("Access denied: cannot create provider for different clinic", 403);
    }

    // Create the provider using Prisma directly (since we need the creation logic)
    const { prisma } = await import("@/lib/database/prisma");
    const provider = await prisma.provider.create({
      data: {
        name: validatedData.name,
        firstName: validatedData.first_name,
        lastName: validatedData.last_name,
        email: validatedData.email,
        providerType: validatedData.provider_type,
        position: validatedData.position,
        status: "active",
        clinicId: clinicId,
      },
    });

    return NextResponse.json({ success: true, data: provider }, { status: 201 });
  } catch (error: unknown) {
    // Handle specific Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return apiError("A provider with this information already exists", 409);
      }

      if (error.code === "P2003") {
        return apiError("Invalid clinic_id provided", 400);
      }
    }

    return handleApiError(error);
  }
}

export const POST = withAuth(createProviderHandler);

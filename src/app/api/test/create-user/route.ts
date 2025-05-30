import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/database/prisma";

export async function POST() {
  try {
    // Get the current user from Supabase Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          authError: authError?.message,
        },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (existingUser) {
      return NextResponse.json({
        message: "User already exists",
        user: existingUser,
      });
    }

    // First, we need a clinic. Let's check if one exists or create a test one
    let clinic = await prisma.clinic.findFirst({
      where: { name: "Test Clinic" },
    });

    if (!clinic) {
      clinic = await prisma.clinic.create({
        data: {
          name: "Test Clinic",
          location: "Test Location",
          status: "active",
        },
      });
    }

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        email: user.email || "",
        name: user.email?.split("@")[0] || "Test User",
        role: "office_manager",
        authId: user.id,
        clinicId: clinic.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: newUser,
      clinic: clinic,
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

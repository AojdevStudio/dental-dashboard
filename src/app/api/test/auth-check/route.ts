import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({
        authenticated: false,
        error: error.message,
      });
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: "No user session found",
      });
    }

    // Get user details from the database
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("id, email, clinicId, authId")
      .eq("authId", user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        authId: user.id,
        email: user.email,
        dbUser: userData,
        dbError: dbError?.message,
      },
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

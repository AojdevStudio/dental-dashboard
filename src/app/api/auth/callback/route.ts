import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Handle auth callbacks via API route for non-browser environments
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Return error JSON or redirect to error page
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If successful, redirect to dashboard or return success
    return NextResponse.json({ success: true });
  }

  // If no code is provided, return error
  return NextResponse.json({ error: "No code provided" }, { status: 400 });
}

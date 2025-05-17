"use server";

import { createClient } from "@/lib/supabase/server";

export type Provider = "google" | "github" | "azure";

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();

  // Use the client-side callback component for handling the auth flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

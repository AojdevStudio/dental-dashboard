"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SignupData = {
  email: string;
  password: string;
};

export async function signUp({ email, password }: SignupData) {
  const supabase = await createClient();

  // Use the API callback route for better security and handling
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Check your email for the confirmation link" };
}

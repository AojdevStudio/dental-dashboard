"use server";

import { createClient } from "@/lib/supabase/server";

export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password/confirm`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password reset link sent to your email" };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password updated successfully" };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  return { session: data.session };
}

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return { user: data.user };
}

export async function requireAuth() {
  const { user } = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

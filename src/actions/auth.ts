"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getRandomGradient } from "@/lib/avatars";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

import { loginSchema, signupSchema, LoginValues, SignupValues } from "@/lib/schemas";

export async function login(data: LoginValues) {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid input data" };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(data: SignupValues) {
  const origin = (await headers()).get("origin");
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid input data" };
  }

  const { email, password, firstName, lastName } = result.data;
  const fullName = `${firstName} ${lastName}`.trim();

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Assign a default avatar gradient for the new user
  if (authData.user) {
    const gradient = getRandomGradient(authData.user.id);
    try {
      await db
        .update(profiles)
        .set({ avatarUrl: gradient })
        .where(eq(profiles.id, authData.user.id));
      await supabase.auth.updateUser({
        data: { avatar_url: gradient },
      });
    } catch {
      // Non-critical — user can pick an avatar later
    }
  }

  // If email confirmation is disabled, we get a session immediately
  if (authData.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return { success: true, message: "Check your email to confirm your account." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

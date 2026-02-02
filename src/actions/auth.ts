"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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

  const { error } = await supabase.auth.signUp({
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

  return { success: true, message: "Check your email to confirm your account." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateUserAvatar(gradient: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  try {
    // Update Profile Table
    await db.update(profiles).set({ avatarUrl: gradient }).where(eq(profiles.id, user.id));

    // Update Auth Metadata (optional, but good for client synced session)
    await supabase.auth.updateUser({
      data: { avatar_url: gradient },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update avatar" };
  }
}

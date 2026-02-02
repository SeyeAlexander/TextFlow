"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const folderId = formData.get("folderId") as string | null;

  if (!name) return { error: "Name is required" };

  try {
    const [newDoc] = await db
      .insert(documents)
      .values({
        ownerId: user.id,
        name,
        folderId: folderId || null,
        content: {}, // Empty Lexical state
      })
      .returning({ id: documents.id });

    revalidatePath("/dashboard");
    return { success: true, id: newDoc.id };
  } catch (error) {
    console.error("Create file error:", error);
    return { error: "Failed to create file" };
  }
}

export async function renameFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;

  if (!id || !name) return { error: "ID and Name required" };

  try {
    await db
      .update(documents)
      .set({ name })
      .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to rename file" };
  }
}

export async function deleteFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) return { error: "ID required" };

  try {
    await db.delete(documents).where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete file" };
  }
}

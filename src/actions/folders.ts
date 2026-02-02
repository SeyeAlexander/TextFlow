"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { folders, documents } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

export async function createFolder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!name) return { error: "Name is required" };

  try {
    await db.insert(folders).values({
      ownerId: user.id,
      name,
      parentId: parentId || null,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create folder error:", error);
    return { error: "Failed to create folder" };
  }
}

export async function renameFolder(formData: FormData) {
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
      .update(folders)
      .set({ name })
      .where(and(eq(folders.id, id), eq(folders.ownerId, user.id)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to rename folder" };
  }
}

export async function deleteFolder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const deleteFiles = formData.get("deleteFiles") === "true";

  if (!id) return { error: "ID required" };

  try {
    await db.transaction(async (tx) => {
      // 1. Handle files in the folder
      if (deleteFiles) {
        // Cascade delete: remove all files in this folder
        await tx
          .delete(documents)
          .where(and(eq(documents.folderId, id), eq(documents.ownerId, user.id)));
      } else {
        // Unlink: keep files, move to root (folderId = null)
        await tx
          .update(documents)
          .set({ folderId: null })
          .where(and(eq(documents.folderId, id), eq(documents.ownerId, user.id)));
      }

      // 2. Delete the folder itself
      await tx.delete(folders).where(and(eq(folders.id, id), eq(folders.ownerId, user.id)));
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete folder error:", error);
    return { error: "Failed to delete folder" };
  }
}

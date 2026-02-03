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
  const id = formData.get("id") as string | null;

  if (!name) return { error: "Name is required" };

  try {
    const emptyLexicalState = {
      root: {
        children: [
          {
            children: [],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };

    const values: any = {
      ownerId: user.id,
      name,
      folderId: folderId || null,
      content: emptyLexicalState,
    };

    // Use provided ID if available
    if (id) {
      values.id = id;
    }

    const [newDoc] = await db.insert(documents).values(values).returning({ id: documents.id });

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
  const folderId = formData.get("folderId") as string | null;

  if (!id) return { error: "ID required" };
  // If we are renaming, we need a name. If moving, we might not need a name (use current).
  // But to keep it simple, we allow either or both.

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (formData.has("folderId")) updateData.folderId = folderId || null; // Allow null to move to root

    if (Object.keys(updateData).length === 0) return { error: "No changes provided" };

    await db
      .update(documents)
      .set(updateData)
      .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update file" };
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

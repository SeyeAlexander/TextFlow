"use server";

/**
 * Server actions for Y.js document state persistence
 */

import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

/**
 * Load Y.js state for a document
 * Returns base64-encoded Y.js state or null if none exists
 */
export async function loadDocumentYjsState(documentId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select({ yjsState: documents.yjsState })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Document not found");
  }

  return result[0].yjsState;
}

/**
 * Save Y.js state for a document
 * Expects base64-encoded Y.js state
 */
export async function saveDocumentYjsState(
  documentId: string,
  yjsState: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(documents)
      .set({
        yjsState,
      })
      .where(eq(documents.id, documentId));

    return { success: true };
  } catch (error) {
    console.error("Error saving Y.js state:", error);
    return { success: false, error: "Failed to save document state" };
  }
}

/**
 * Initialize a new document with empty Y.js state
 * Called when creating a new document or when no Y.js state exists
 */
export async function initializeDocumentYjsState(documentId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Empty Y.js state will be created on the client side
  // This action can be used for any initialization logic needed
  await db.update(documents).set({ updatedAt: new Date() }).where(eq(documents.id, documentId));
}

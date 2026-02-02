"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { documentCollaborators, documents, notifications, profiles } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function shareDocument(documentId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // 1. Check ownership or editor rights (RLS handles this mostly, but good to check explicit ownership for sharing rights)
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!doc) return { error: "Document not found" };
  if (doc.ownerId !== user.id) {
    // Check if is collaborator? Typically only owners add others, or editors.
    // For now, strict: Only Owner can share.
    return { error: "Only the owner can share this document" };
  }

  // 2. Check Limit (Max 5 collaborators)
  const collaborators = await db
    .select()
    .from(documentCollaborators)
    .where(eq(documentCollaborators.documentId, documentId));

  if (collaborators.length >= 5) {
    return { error: "Collaborator limit (5) reached" };
  }

  // 3. Find target user
  const targetUser = await db.query.profiles.findFirst({
    where: eq(profiles.email, email),
  });

  if (!targetUser) {
    return { error: "User not found. They must sign up for TextFlow first." };
  }

  if (targetUser.id === user.id) {
    return { error: "You cannot invite yourself" };
  }

  // Check if already added
  const existing = collaborators.find((c) => c.userId === targetUser.id);
  if (existing) {
    return { error: "User is already a collaborator" };
  }

  try {
    // 4. Add Collaborator & Send Notification
    await db.transaction(async (tx) => {
      // Add
      await tx.insert(documentCollaborators).values({
        documentId,
        userId: targetUser.id,
      });

      // Notify
      await tx.insert(notifications).values({
        recipientId: targetUser.id,
        senderId: user.id,
        type: "invite",
        data: { documentId, documentName: doc.name },
      });
    });

    // 5. Add to Chat if exists (Best effort)
    try {
      const chats = await import("./chat"); // Dynamic import to avoid circular dep if needed, or import at top
      const chat = await chats.getChatForDocument(documentId);
      if (chat) {
        await chats.addChatParticipant(chat.id, targetUser.id);
      }
    } catch (e) {
      // Ignore chat add errors, not critical for sharing
      console.error("Failed to add to chat:", e);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Share error:", error);
    return { error: "Failed to share document" };
  }
}

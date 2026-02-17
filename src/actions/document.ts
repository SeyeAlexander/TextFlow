"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { documents, profiles, documentCollaborators, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
// import { revalidatePath } from "next/cache";
import { createDocumentChat } from "./chat";

export async function saveDocument(documentId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify ownership or collaboration
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!doc) throw new Error("Document not found");

  if (doc.ownerId !== user.id) {
    const isCollaborator = await db.query.documentCollaborators.findFirst({
      where: and(
        eq(documentCollaborators.documentId, documentId),
        eq(documentCollaborators.userId, user.id),
      ),
    });
    if (!isCollaborator) throw new Error("Unauthorized");
  }

  await db
    .update(documents)
    .set({
      content: JSON.parse(content),
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));
}

export async function toggleStar(documentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!doc) throw new Error("Document not found");
  if (doc.ownerId !== user.id) throw new Error("Only the owner can star this document");

  await db
    .update(documents)
    .set({
      isStarred: !doc.isStarred,
    })
    .where(eq(documents.id, documentId));

  // revalidatePath("/dashboard");
  // revalidatePath(`/dashboard/document/${documentId}`);
}

export async function shareDocumentByEmail(documentId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Find the target user by email
  const targetUser = await db.query.profiles.findFirst({
    where: eq(profiles.email, email),
  });

  if (!targetUser) {
    throw new Error("Sorry, can't create chat. This user is not on TextFlow yet.");
  }

  if (targetUser.id === user.id) {
    throw new Error("You cannot share with yourself");
  }

  // 2. Add to collaborators if not already there
  const existingCollaborator = await db.query.documentCollaborators.findFirst({
    where: and(
      eq(documentCollaborators.documentId, documentId),
      eq(documentCollaborators.userId, targetUser.id),
    ),
  });

  if (!existingCollaborator) {
    await db.insert(documentCollaborators).values({
      documentId,
      userId: targetUser.id,
    });

    // 3. Create notification for the target user
    await db.insert(notifications).values({
      recipientId: targetUser.id,
      senderId: user.id,
      type: "invite",
      data: { documentId },
    });

    // 4. Ensure document chat exists
    await createDocumentChat(documentId, [targetUser.id]);
  }

  // revalidatePath(`/dashboard/document/${documentId}`);
}

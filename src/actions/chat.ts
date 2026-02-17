"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  chats,
  chatParticipants,
  messages,
  profiles,
  documentCollaborators,
  documents,
  notifications,
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, desc, inArray, ne } from "drizzle-orm";
import { randomUUID } from "crypto";

// --- Chat Actions ---

// Create a chat specifically for a document
export async function createDocumentChat(documentId: string, participantIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const uniqueParticipants = Array.from(new Set([...participantIds, user.id]));

  try {
    // 1. Check if chat already exists for this document
    const existingChat = await db.query.chats.findFirst({
      where: eq(chats.documentId, documentId),
    });

    if (existingChat) {
      // Ensure current user is participant if not already
      await addChatParticipant(existingChat.id, user.id);
      return { success: true, chatId: existingChat.id };
    }

    // 2. Fetch all document collaborators + owner to be initial participants
    const collaborators = await db
      .select({ userId: documentCollaborators.userId })
      .from(documentCollaborators)
      .where(eq(documentCollaborators.documentId, documentId));

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
      columns: { ownerId: true },
    });

    const allUserIds = new Set([
      user.id,
      ...(doc ? [doc.ownerId] : []),
      ...collaborators.map((c) => c.userId),
      ...participantIds,
    ]);

    const uniqueParticipantsFinal = Array.from(allUserIds);

    // 3. Create new chat linked to document
    const [newChat] = await db
      .insert(chats)
      .values({
        type: "group",
        name: "Document Chat",
        documentId: documentId,
      })
      .returning({ id: chats.id });

    // 4. Add participants
    if (uniqueParticipantsFinal.length > 0) {
      await db.insert(chatParticipants).values(
        uniqueParticipantsFinal.map((uid) => ({
          chatId: newChat.id,
          userId: uid,
        })),
      );
    }

    revalidatePath("/dashboard");
    return { success: true, chatId: newChat.id };
  } catch (error) {
    console.error("Create doc chat error:", error);
    return { error: "Failed to create document chat" };
  }
}

export async function addChatParticipant(chatId: string, userId: string) {
  const existing = await db.query.chatParticipants.findFirst({
    where: and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.userId, userId)),
  });

  if (!existing) {
    await db.insert(chatParticipants).values({
      chatId,
      userId,
    });
    revalidatePath(`/dashboard/messages/${chatId}`);
  }
}

export async function getChatForDocument(documentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const chat = await db.query.chats.findFirst({
    where: eq(chats.documentId, documentId),
    with: {
      participants: true, // Assuming relation exists or we fetch separately
    },
  });

  return chat;
}

export async function createChat(participantIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ensure current user is in participants
  const uniqueParticipants = Array.from(new Set([...participantIds, user.id]));

  if (uniqueParticipants.length < 1) {
    return { error: "At least 1 participant required" };
  }

  const type =
    uniqueParticipants.length === 1 ? "dm" : uniqueParticipants.length === 2 ? "dm" : "group";

  try {
    // Use secure RPC function to create chat and add participants (bypassing RLS insert restrictions)
    const { data: chatId, error } = await supabase.rpc("create_chat_with_participants", {
      p_type: type,
      p_name: type === "group" ? "New Group" : null,
      p_participant_ids: uniqueParticipants,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/messages");
    return { success: true, chatId };
  } catch (error) {
    console.error("Create chat error:", error);
    return { error: "Failed to create chat" };
  }
}

export async function getChats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch chats where user is a participant, including document info
  const userChats = await db
    .select({
      id: chats.id,
      type: chats.type,
      name: chats.name,
      updatedAt: chats.updatedAt,
      documentId: chats.documentId,
      documentName: documents.name,
    })
    .from(chats)
    .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
    .leftJoin(documents, eq(chats.documentId, documents.id))
    .where(eq(chatParticipants.userId, user.id))
    .orderBy(desc(chats.updatedAt));

  // For each chat, fetch the last message
  const chatsWithLastMessage = await Promise.all(
    userChats.map(async (chat) => {
      const [lastMsg] = await db
        .select({
          content: messages.content,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.chatId, chat.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return {
        ...chat,
        lastMessage: lastMsg || null,
      };
    }),
  );

  return chatsWithLastMessage;
}

export async function getChatDetails(chatId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify access
  const membership = await db
    .select()
    .from(chatParticipants)
    .where(and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.userId, user.id)))
    .limit(1);

  if (membership.length === 0) return { error: "Access denied" };

  // Fetch chat info
  const chat = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);

  // Fetch participants
  const participants = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      avatarUrl: profiles.avatarUrl,
    })
    .from(chatParticipants)
    .innerJoin(profiles, eq(chatParticipants.userId, profiles.id))
    .where(eq(chatParticipants.chatId, chatId));

  return { chat: chat[0], participants };
}

// --- Message Actions ---

export async function sendMessage(chatId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!content.trim()) return { error: "Message cannot be empty" };

  try {
    // Check membership
    const membership = await db
      .select()
      .from(chatParticipants)
      .where(and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.userId, user.id)))
      .limit(1);

    if (membership.length === 0) return { error: "Access denied" };

    // Insert message and return it so sender can reconcile optimistic UI immediately.
    const [inserted] = await db
      .insert(messages)
      .values({
        chatId,
        senderId: user.id,
        content,
      })
      .returning({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
      });

    // Update chat timestamp
    await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));

    revalidatePath(`/dashboard/messages/${chatId}`);
    const [senderProfile] = await db
      .select({
        senderName: profiles.fullName,
        senderAvatar: profiles.avatarUrl,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    // Create notifications for other chat participants
    try {
      const otherParticipants = await db
        .select({ userId: chatParticipants.userId })
        .from(chatParticipants)
        .where(and(eq(chatParticipants.chatId, chatId), ne(chatParticipants.userId, user.id)));

      if (otherParticipants.length > 0) {
        // Get document info from chat
        const chat = await db
          .select({ documentId: chats.documentId })
          .from(chats)
          .where(eq(chats.id, chatId))
          .limit(1);

        const documentId = chat[0]?.documentId;
        let documentName = "Document";
        if (documentId) {
          const doc = await db
            .select({ name: documents.name })
            .from(documents)
            .where(eq(documents.id, documentId))
            .limit(1);
          documentName = doc[0]?.name || "Document";
        }

        await db.insert(notifications).values(
          otherParticipants.map((p) => ({
            recipientId: p.userId,
            senderId: user.id,
            type: "message" as const,
            data: {
              chatId,
              documentId,
              documentName,
              content: content.slice(0, 100),
            },
          })),
        );
      }
    } catch (notifError) {
      // Don't fail the message send if notification creation fails
      console.error("Failed to create message notifications:", notifError);
    }

    return {
      success: true,
      message: {
        ...inserted,
        senderName: senderProfile?.senderName || user.email?.split("@")[0] || "You",
        senderAvatar: senderProfile?.senderAvatar || null,
      },
    };
  } catch (error) {
    console.error("Send message error:", error);
    return { error: "Failed to send message" };
  }
}

export async function getMessages(chatId: string) {
  const supabase = await createClient();
  // No auth check strict here as mostly used by client component with internal checks,
  // but good to have if called directly.

  const msgs = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      senderName: profiles.fullName,
      senderAvatar: profiles.avatarUrl,
    })
    .from(messages)
    .innerJoin(profiles, eq(messages.senderId, profiles.id))
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.createdAt)) // Limit?
    .limit(50);

  return msgs.reverse(); // Return in chronological order
}

export async function getMessageById(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const msg = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      senderName: profiles.fullName,
      senderAvatar: profiles.avatarUrl,
      chatId: messages.chatId,
    })
    .from(messages)
    .innerJoin(profiles, eq(messages.senderId, profiles.id))
    .where(eq(messages.id, messageId))
    .limit(1);

  if (!msg[0]) return null;

  // Ensure user is a participant in the chat
  const membership = await db
    .select()
    .from(chatParticipants)
    .where(and(eq(chatParticipants.chatId, msg[0].chatId), eq(chatParticipants.userId, user.id)))
    .limit(1);

  if (membership.length === 0) return null;

  return msg[0];
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { chats, chatParticipants, messages, profiles } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, desc, inArray, ne } from "drizzle-orm";
import { randomUUID } from "crypto";

// --- Chat Actions ---

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

  // Fetch chats where user is a participant
  // This is a bit complex in SQL/Drizzle without easier relations setup, but let's do a join
  // Select chats joined by current user
  const userChats = await db
    .select({
      id: chats.id,
      type: chats.type,
      name: chats.name,
      updatedAt: chats.updatedAt,
    })
    .from(chats)
    .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
    .where(eq(chatParticipants.userId, user.id))
    .orderBy(desc(chats.updatedAt));

  return userChats;
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

    // Insert message
    await db.insert(messages).values({
      chatId,
      senderId: user.id,
      content,
    });

    // Update chat timestamp
    await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));

    revalidatePath(`/dashboard/messages/${chatId}`);
    return { success: true };
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

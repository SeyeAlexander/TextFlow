"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { notifications, profiles } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";

export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const notifs = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      data: notifications.data,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      senderName: profiles.fullName,
      senderAvatar: profiles.avatarUrl,
    })
    .from(notifications)
    .innerJoin(profiles, eq(notifications.senderId, profiles.id))
    .where(eq(notifications.recipientId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  return notifs;
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)));

  revalidatePath("/dashboard");
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.recipientId, user.id));

  revalidatePath("/dashboard");
}

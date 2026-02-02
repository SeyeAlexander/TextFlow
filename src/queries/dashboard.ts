import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { folders, documents } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getDashboardData(folderId: string | null = null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallel fetch for folders and files
  const [userFolders, userFiles] = await Promise.all([
    db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.ownerId, user.id),
          folderId ? eq(folders.parentId, folderId) : isNull(folders.parentId),
        ),
      )
      .orderBy(desc(folders.createdAt)),
    db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.ownerId, user.id),
          folderId ? eq(documents.folderId, folderId) : isNull(documents.folderId),
        ),
      )
      .orderBy(desc(documents.updatedAt)),
  ]);

  // Transform data to match UI types
  const formattedFolders = userFolders.map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId,
    isOpen: false, // Default state
    createdAt: f.createdAt,
  }));

  const formattedFiles = userFiles.map((d) => ({
    id: d.id,
    name: d.name,
    type: "document" as const, // We only support documents for now
    size: "1.2 KB", // Mock size
    content: JSON.stringify(d.content),
    folderId: d.folderId,
    starred: false, // Not implemented in DB yet
    shared: d.isPublic || false,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return {
    folders: formattedFolders,
    files: formattedFiles,
  };
}

export async function getRecentFiles() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const recentFiles = await db
    .select()
    .from(documents)
    .where(eq(documents.ownerId, user.id))
    .orderBy(desc(documents.lastAccessedAt))
    .limit(10);

  return recentFiles;
}

export async function getSidebarData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { folders: [], recentFiles: [] };

  // Fetch ALL folders for the tree structure (lightweight)
  const allFolders = await db
    .select()
    .from(folders)
    .where(eq(folders.ownerId, user.id))
    .orderBy(desc(folders.createdAt));

  // Fetch recent files
  const recentFiles = await db
    .select()
    .from(documents)
    .where(eq(documents.ownerId, user.id))
    .orderBy(desc(documents.updatedAt)) // Use updatedAt for "recent"
    .limit(10);

  // Transform
  return {
    folders: allFolders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      isOpen: false,
      createdAt: f.createdAt,
    })),
    recentFiles: recentFiles.map((d) => ({
      id: d.id,
      name: d.name,
      type: "document" as const,
      size: "0 KB",
      folderId: d.folderId,
      starred: false,
      shared: d.isPublic || false,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
  };
}

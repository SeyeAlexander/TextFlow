import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { folders, documents, documentCollaborators, notifications } from "@/db/schema";
import { eq, and, isNull, desc, or, exists, ilike, count } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getDashboardData(folderId: string | null = null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { folders: [], files: [] }; // Return empty instead of redirect to avoid 500 on fetch
  }

  let userFolders: any[] = [];
  let userFiles: any[] = [];

  try {
    // Simplified fetch for folders
    userFolders = await db
      .select({
        id: folders.id,
        name: folders.name,
        parentId: folders.parentId,
        createdAt: folders.createdAt,
        ownerId: folders.ownerId,
      })
      .from(folders)
      .where(
        and(
          eq(folders.ownerId, user.id),
          folderId ? eq(folders.parentId, folderId) : isNull(folders.parentId),
        ),
      )
      .orderBy(desc(folders.createdAt));

    // Re-enable files fetch
    userFiles = await db
      .select()
      .from(documents)
      .where(
        folderId
          ? and(eq(documents.ownerId, user.id), eq(documents.folderId, folderId))
          : eq(documents.ownerId, user.id),
      )
      .orderBy(desc(documents.updatedAt));
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    // Return empty but valid structure so UI doesn't crash 500
    return { folders: [], files: [] };
  }

  // Fetch file counts
  try {
    const folderCounts = await db
      .select({
        folderId: documents.folderId,
        count: count(documents.id),
      })
      .from(documents)
      .where(eq(documents.ownerId, user.id))
      .groupBy(documents.folderId);

    const countMap = new Map(folderCounts.map((c) => [c.folderId, Number(c.count)]));

    // Transform data
    const formattedFolders = userFolders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      isOpen: false,
      createdAt: f.createdAt,
      fileCount: countMap.get(f.id) || 0,
    }));

    const formattedFiles = userFiles.map((d) => ({
      id: d.id,
      name: d.name,
      type: "document" as const,
      size: "0 KB",
      content: JSON.stringify(d.content),
      folderId: d.folderId,
      starred: d.isStarred || false,
      shared: d.isPublic || false,
      updatedAt: d.updatedAt,
      createdAt: d.createdAt,
      ownerId: d.ownerId,
    }));

    // Fetch current folder details if viewing a specific folder
    let currentFolder = null;
    if (folderId) {
      const [folder] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, folderId), eq(folders.ownerId, user.id)));

      if (folder) {
        currentFolder = {
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId,
          createdAt: folder.createdAt,
        };
      }
    }

    return {
      folders: formattedFolders,
      files: formattedFiles,
      currentFolder,
    };
  } catch (error) {
    console.error("Error processing dashboard data", error);
    return { folders: [], files: [], currentFolder: null };
  }
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
    .where(
      or(
        eq(documents.ownerId, user.id),
        exists(
          db
            .select()
            .from(documentCollaborators)
            .where(
              and(
                eq(documentCollaborators.documentId, documents.id),
                eq(documentCollaborators.userId, user.id),
              ),
            ),
        ),
      ),
    )
    .orderBy(desc(documents.lastAccessedAt))
    .limit(20);

  return recentFiles.map((d) => ({
    id: d.id,
    name: d.name,
    type: "document" as const,
    size: "0 KB",
    folderId: d.folderId,
    starred: d.isStarred || false,
    shared: d.isPublic || false,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  }));
}

export async function getStarredFiles() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const starredFiles = await db
    .select()
    .from(documents)
    .where(and(eq(documents.ownerId, user.id), eq(documents.isStarred, true)))
    .orderBy(desc(documents.updatedAt));

  return starredFiles.map((d) => ({
    id: d.id,
    name: d.name,
    type: "document" as const,
    size: "0 KB",
    folderId: d.folderId,
    starred: true,
    shared: d.isPublic || false,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  }));
}

export async function getSharedFiles() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sharedFiles = await db
    .select()
    .from(documents)
    .innerJoin(documentCollaborators, eq(documentCollaborators.documentId, documents.id))
    .where(eq(documentCollaborators.userId, user.id))
    .orderBy(desc(documents.updatedAt));

  return sharedFiles.map(({ documents: d }) => ({
    id: d.id,
    name: d.name,
    type: "document" as const,
    size: "0 KB",
    folderId: d.folderId,
    starred: d.isStarred || false,
    shared: true,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  }));
}

export async function getSidebarData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { folders: [], recentFiles: [] };

  // Fetch ALL folders for the tree structure (lightweight)
  const allFolders = await db
    .select({
      id: folders.id,
      name: folders.name,
      parentId: folders.parentId,
      createdAt: folders.createdAt,
      ownerId: folders.ownerId,
    })
    .from(folders)
    .where(eq(folders.ownerId, user.id))
    .orderBy(desc(folders.createdAt));

  // Fetch recent files
  const recentFiles = await db
    .select()
    .from(documents)
    .where(
      or(
        eq(documents.ownerId, user.id),
        exists(
          db
            .select()
            .from(documentCollaborators)
            .where(
              and(
                eq(documentCollaborators.documentId, documents.id),
                eq(documentCollaborators.userId, user.id),
              ),
            ),
        ),
      ),
    )
    .orderBy(desc(documents.updatedAt)) // Use updatedAt for "recent"
    .limit(20); // Increased limit due to mixed types

  // Fetch file counts for sidebar
  const folderCounts = await db
    .select({
      folderId: documents.folderId,
      count: count(documents.id),
    })
    .from(documents)
    .where(eq(documents.ownerId, user.id))
    .groupBy(documents.folderId);

  const countMap = new Map(folderCounts.map((c) => [c.folderId, Number(c.count)]));

  // Fetch unread notifications count
  const [{ count: unreadCount }] = await db
    .select({ count: count(notifications.id) })
    .from(notifications)
    .where(and(eq(notifications.recipientId, user.id), eq(notifications.isRead, false)));

  // Transform
  return {
    folders: allFolders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      isOpen: false,
      createdAt: f.createdAt,
      fileCount: countMap.get(f.id) || 0,
    })),
    files: recentFiles.map((d) => ({
      id: d.id,
      name: d.name,
      type: "document" as const,
      size: "0 KB",
      folderId: d.folderId,
      starred: d.isStarred || false,
      shared: d.isPublic || false,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
    unreadCount: Number(unreadCount),
  };
}

export async function getDocumentById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });

  if (!doc) return null;

  // Check access (owner or collaborator)
  if (doc.ownerId !== user.id && !doc.isPublic) {
    const isCollaborator = await db.query.documentCollaborators.findFirst({
      where: and(
        eq(documentCollaborators.documentId, id),
        eq(documentCollaborators.userId, user.id),
      ),
    });
    if (!isCollaborator) return null;
  }

  // Check if document has any collaborators to determine 'shared' status
  const [collaboratorCheck] = await db
    .select({ count: count(documentCollaborators.userId) })
    .from(documentCollaborators)
    .where(eq(documentCollaborators.documentId, id));

  const isShared = doc.isPublic || collaboratorCheck?.count > 0;

  return {
    ...doc,
    starred: doc.isStarred || false,
    shared: isShared,
    content: doc.content as any,
  };
}

export async function searchDocuments(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Search in documents owned by or shared with the user
  const results = await db
    .select()
    .from(documents)
    .where(
      and(
        ilike(documents.name, `%${query}%`),
        or(
          eq(documents.ownerId, user.id),
          exists(
            db
              .select()
              .from(documentCollaborators)
              .where(
                and(
                  eq(documentCollaborators.documentId, documents.id),
                  eq(documentCollaborators.userId, user.id),
                ),
              ),
          ),
        ),
      ),
    )
    .orderBy(desc(documents.updatedAt))
    .limit(20);

  return results.map((d) => ({
    id: d.id,
    name: d.name,
    type: "document" as const,
    size: "0 KB",
    folderId: d.folderId,
    starred: d.isStarred || false,
    shared: d.isPublic || false,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  }));
}

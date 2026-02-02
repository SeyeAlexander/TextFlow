"use server";

import {
  getDashboardData,
  getSidebarData,
  getRecentFiles,
  getSharedFiles,
  getStarredFiles,
  getDocumentById,
  searchDocuments as searchDocumentsQuery,
} from "@/queries/dashboard";

/**
 * Server Action to fetch dashboard data for client-side use (if needed for client-nav hydration)
 */
export async function fetchFolderContent(folderId: string | null) {
  return await getDashboardData(folderId);
}

export async function fetchSidebarData() {
  return await getSidebarData();
}

export async function fetchRecentFiles() {
  return await getRecentFiles();
}

export async function fetchSharedFiles() {
  return await getSharedFiles();
}

export async function fetchStarredFiles() {
  return await getStarredFiles();
}

export async function fetchDocumentById(id: string) {
  return await getDocumentById(id);
}

export async function searchDocuments(query: string) {
  return await searchDocumentsQuery(query);
}

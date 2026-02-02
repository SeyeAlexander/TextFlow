"use server";

import { getDashboardData, getSidebarData } from "@/queries/dashboard";

/**
 * Server Action to fetch dashboard data for client-side use (if needed for client-nav hydration)
 */
export async function fetchFolderContent(folderId: string | null) {
  return await getDashboardData(folderId);
}

export async function fetchSidebarData() {
  return await getSidebarData();
}

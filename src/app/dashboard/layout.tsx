"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchModal } from "@/components/dashboard/search-modal";
import { SettingsModal } from "@/components/dashboard/settings-modal";
import { MobileRestriction } from "@/components/shared/mobile-restriction";
import { useTextFlowStore } from "@/store/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useTextFlowStore((state) => state.sidebarCollapsed);

  return (
    <div className='flex h-screen overflow-hidden bg-[#F5F5F5] dark:bg-[#111] font-sans text-neutral-900 dark:text-neutral-50'>
      <MobileRestriction />
      <AppSidebar collapsed={sidebarCollapsed} />
      {children}
      <SearchModal />
      <SettingsModal />
    </div>
  );
}

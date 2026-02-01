"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchModal } from "@/components/dashboard/search-modal";
import { SettingsModal } from "@/components/dashboard/settings-modal";
import { MobileRestriction } from "@/components/shared/mobile-restriction";
import { initializeDummyData } from "@/data/dummy-data";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Initialize dummy data
  useEffect(() => {
    initializeDummyData();
  }, []);

  return (
    <div className='flex h-screen overflow-hidden bg-[#F5F5F5] dark:bg-[#111] font-sans text-neutral-900 dark:text-neutral-50'>
      <MobileRestriction />
      <AppSidebar />
      {children}
      <SearchModal />
      <SettingsModal />
    </div>
  );
}

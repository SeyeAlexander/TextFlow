"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { Editor } from "@/components/editor";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col bg-background'>
          <Editor />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

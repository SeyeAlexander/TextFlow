"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Star,
  Trash2,
  Share2,
  Settings,
  MoreHorizontal,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

// Mock data for documents
const mockDocuments = [
  { id: "1", title: "Getting Started", emoji: "🚀", updatedAt: "2 hours ago" },
  { id: "2", title: "Project Notes", emoji: "📝", updatedAt: "Yesterday" },
  { id: "3", title: "Meeting Minutes", emoji: "📅", updatedAt: "3 days ago" },
  { id: "4", title: "Ideas & Brainstorming", emoji: "💡", updatedAt: "1 week ago" },
];

const sharedDocuments = [
  { id: "5", title: "Team Handbook", emoji: "📖", owner: "Sarah M." },
  { id: "6", title: "Q4 Planning", emoji: "📊", owner: "John D." },
];

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className='min-h-screen flex bg-background'>
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Sidebar header */}
        <div className='flex items-center justify-between p-3 h-14'>
          {!sidebarCollapsed && (
            <div className='flex items-center gap-2'>
              <div className='size-8 rounded-lg bg-primary flex items-center justify-center'>
                <FileText className='size-4 text-primary-foreground' />
              </div>
              <span className='font-semibold'>TextFlow</span>
            </div>
          )}
          <Button
            variant='ghost'
            size='icon'
            className='size-8 shrink-0'
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className='size-4' />
            ) : (
              <ChevronLeft className='size-4' />
            )}
          </Button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className='px-3 mb-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
              <Input
                placeholder='Search documents...'
                className='h-9 pl-8 bg-sidebar-accent/50'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* New document button */}
        <div className='px-3 mb-2'>
          <Button
            className={cn(
              "w-full justify-start gap-2",
              sidebarCollapsed && "w-10 px-0 justify-center",
            )}
            size='sm'
          >
            <Plus className='size-4' />
            {!sidebarCollapsed && "New Document"}
          </Button>
        </div>

        <Separator className='mx-3 w-auto' />

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-2'>
          {/* Main navigation */}
          <div className='px-3 space-y-1'>
            <SidebarItem icon={Home} label='Home' collapsed={sidebarCollapsed} active />
            <SidebarItem icon={Star} label='Favorites' collapsed={sidebarCollapsed} />
            <SidebarItem icon={Share2} label='Shared with me' collapsed={sidebarCollapsed} />
            <SidebarItem icon={Trash2} label='Trash' collapsed={sidebarCollapsed} />
          </div>

          {/* Private documents */}
          {!sidebarCollapsed && (
            <>
              <div className='px-3 mt-6 mb-2'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Private
                </p>
              </div>
              <div className='px-2 space-y-0.5'>
                {mockDocuments.map((doc) => (
                  <DocumentItem key={doc.id} document={doc} />
                ))}
              </div>

              {/* Shared documents */}
              <div className='px-3 mt-6 mb-2'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Shared
                </p>
              </div>
              <div className='px-2 space-y-0.5'>
                {sharedDocuments.map((doc) => (
                  <DocumentItem key={doc.id} document={doc} shared />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User menu */}
        <div className='p-3 border-t'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors",
                  sidebarCollapsed && "justify-center",
                )}
              >
                <Avatar className='size-8'>
                  <AvatarImage src='' />
                  <AvatarFallback className='bg-primary/10 text-primary text-sm'>JD</AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className='flex-1 text-left'>
                    <p className='text-sm font-medium'>John Doe</p>
                    <p className='text-xs text-muted-foreground'>john@example.com</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuItem>
                <Settings className='size-4 mr-2' />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive'>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className='flex-1 flex flex-col min-w-0'>
        {/* Top bar */}
        <header className='flex items-center justify-between h-14 px-4 border-b shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>📝</span>
            <h1 className='font-medium'>Getting Started</h1>
          </div>

          <div className='flex items-center gap-2'>
            {/* Collaborators */}
            <div className='flex -space-x-2 mr-2'>
              <Avatar className='size-7 border-2 border-background'>
                <AvatarFallback className='text-xs bg-blue-500 text-white'>SM</AvatarFallback>
              </Avatar>
              <Avatar className='size-7 border-2 border-background'>
                <AvatarFallback className='text-xs bg-green-500 text-white'>JD</AvatarFallback>
              </Avatar>
            </div>

            <Button variant='outline' size='sm'>
              <Share2 className='size-4 mr-2' />
              Share
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='size-9'>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Version history</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-destructive'>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Editor area */}
        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-3xl mx-auto px-8 py-12'>
            {/* Document title */}
            <div className='mb-8'>
              <h1
                className='text-4xl font-bold mb-2 outline-none'
                contentEditable
                suppressContentEditableWarning
              >
                Getting Started
              </h1>
              <p className='text-muted-foreground text-sm'>Last edited 2 hours ago</p>
            </div>

            {/* Editor placeholder - will be replaced with Lexical */}
            <div className='prose prose-neutral dark:prose-invert max-w-none'>
              <p className='text-lg text-muted-foreground'>
                Start typing here, or press{" "}
                <kbd className='px-2 py-1 text-sm bg-muted rounded border'>/</kbd> to add blocks...
              </p>

              <div className='mt-8 p-6 border-2 border-dashed rounded-lg text-center'>
                <File className='size-12 mx-auto mb-4 text-muted-foreground/50' />
                <p className='text-muted-foreground'>Lexical editor will be integrated here</p>
                <p className='text-sm text-muted-foreground/70 mt-2'>
                  Support for headings, lists, code blocks, images, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar navigation item component
function SidebarItem({
  icon: Icon,
  label,
  collapsed,
  active,
}: {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center",
      )}
    >
      <Icon className='size-4 shrink-0' />
      {!collapsed && label}
    </button>
  );
}

// Document list item component
function DocumentItem({
  document,
  shared,
}: {
  document: { id: string; title: string; emoji: string; updatedAt?: string; owner?: string };
  shared?: boolean;
}) {
  return (
    <button className='flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-sm hover:bg-sidebar-accent transition-colors group'>
      <span className='shrink-0'>{document.emoji}</span>
      <span className='flex-1 truncate text-left'>{document.title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span
            className='size-6 shrink-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent-foreground/10 transition-opacity'
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className='size-3.5' />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          {!shared && <DropdownMenuItem>Share</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem className='text-destructive'>
            {shared ? "Remove" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTextFlowStore } from "@/store/store";
import { useTheme } from "next-themes";
import { signOut } from "@/actions/auth";
import { useUser } from "@/hooks/use-user";

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useTextFlowStore();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  const handleLogout = async () => {
    setSettingsOpen(false);
    await signOut();
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
            onClick={() => setSettingsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className='fixed left-1/2 top-1/2 z-50 w-full max-w-xs -translate-x-1/2 -translate-y-1/2'
          >
            <div className='overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1a1a]'>
              {/* Header */}
              <div className='flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5'>
                <h2 className='text-sm font-medium'>Settings</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className='rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10'
                >
                  <X className='size-4' />
                </button>
              </div>

              {/* User Info */}
              <div className='flex items-center gap-3 border-b border-black/5 px-4 py-3 dark:border-white/5'>
                <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500 overflow-hidden relative'>
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || "User"}
                      className='size-full object-cover'
                    />
                  ) : (
                    <User className='size-5 text-white' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium truncate'>
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className='text-[11px] text-muted-foreground truncate'>{user?.email || ""}</p>
                </div>
              </div>

              {/* Settings Items */}
              <div className='p-1.5'>
                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                >
                  {theme === "dark" ? (
                    <Moon className='size-4 text-muted-foreground' />
                  ) : (
                    <Sun className='size-4 text-muted-foreground' />
                  )}
                  <span className='flex-1'>Theme</span>
                  <span className='text-xs text-muted-foreground capitalize'>{theme}</span>
                </button>

                {/* Notifications */}
                <button className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5'>
                  <Bell className='size-4 text-muted-foreground' />
                  <span className='flex-1'>Notifications</span>
                  <span className='text-xs text-muted-foreground'>On</span>
                </button>
              </div>

              {/* Logout */}
              <div className='border-t border-black/5 p-1.5 dark:border-white/5'>
                <button
                  onClick={handleLogout}
                  className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10'
                >
                  <LogOut className='size-4' />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

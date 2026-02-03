// "use client";

// import { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   Search,
//   Plus,
//   FileText,
//   Star,
//   FolderOpen,
//   ChevronRight,
//   ChevronDown,
//   HardDrive,
//   User,
//   MoreVertical,
//   Trash2,
//   Edit3,
//   FolderPlus,
//   MessageCircle,
//   Inbox,
// } from "lucide-react";
// import { useTextFlowStore, TextFlowFile, TextFlowFolder } from "@/store/store";
// import { DotLogo } from "@/components/shared/dot-logo";
// import { NotificationsPopover } from "./notifications-popover";
// // Animated icons
// import {
//   FolderKanbanIcon,
//   type FolderKanbanIconHandle,
// } from "@/components/animatedicons/folder-kanban";
// import { BookTextIcon, type BookTextIconHandle } from "@/components/animatedicons/book-text";
// import { BookmarkIcon, type BookmarkIconHandle } from "@/components/animatedicons/bookmark";
// import { ArchiveIcon, type ArchiveIconHandle } from "@/components/animatedicons/archive";
// import { CogIcon, type CogIconHandle } from "@/components/animatedicons/cog";
// import { ClockIcon, type ClockIconHandle } from "@/components/animatedicons/clock";
// import { SparklesIcon, type SparklesIconHandle } from "@/components/animatedicons/sparkles";
// import { UsersIcon, type UsersIconHandle } from "@/components/animatedicons/users";
// import {
//   MessageSquareMoreIcon,
//   type MessageSquareMoreIconHandle,
// } from "@/components/animatedicons/message-square-more";
// import { MailCheckIcon, type MailCheckIconHandle } from "@/components/animatedicons/mail-check";

// // Unified button styling constants
// const BUTTON_STYLE = "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors";
// const BUTTON_HOVER = "hover:bg-black/5 dark:hover:bg-white/5";
// const BUTTON_ACTIVE = "bg-black/10 dark:bg-white/10";

// // Add Folder Popover
// function AddFolderPopover({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
//   const { addFolder } = useTextFlowStore();
//   const [name, setName] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);
//   const popoverRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     }

//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (name.trim()) {
//       addFolder(name.trim());
//       setName("");
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       ref={popoverRef}
//       initial={{ opacity: 0, scale: 0.95, y: -5 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.95, y: -5 }}
//       className='absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
//     >
//       <form onSubmit={handleSubmit}>
//         <input
//           ref={inputRef}
//           type='text'
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder='Folder name...'
//           className='w-full rounded-md bg-black/5 px-2.5 py-1.5 text-[13px] outline-none dark:bg-white/5'
//         />
//         <div className='mt-2 flex gap-1.5'>
//           <button
//             type='button'
//             onClick={onClose}
//             className='flex-1 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
//           >
//             Cancel
//           </button>
//           <button
//             type='submit'
//             className='flex-1 rounded-md bg-black/10 px-2 py-1.5 text-[11px] font-medium dark:bg-white/10'
//           >
//             Create
//           </button>
//         </div>
//       </form>
//     </motion.div>
//   );
// }

// // Add to Folder Submenu
// function AddToFolderMenu({
//   fileId,
//   onClose,
//   position,
// }: {
//   fileId: string;
//   onClose: () => void;
//   position: { x: number; y: number };
// }) {
//   const { updateFile, getFoldersByParent } = useTextFlowStore();
//   const topLevelFolders = getFoldersByParent(null);

//   const handleAddToFolder = (folderId: string) => {
//     updateFile(fileId, { folderId });
//     onClose();
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -5 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -5 }}
//       style={{ left: position.x + 140, top: position.y }}
//       className='fixed z-60 w-40 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
//     >
//       <div className='px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
//         Move to folder
//       </div>
//       {topLevelFolders.length === 0 ? (
//         <div className='px-3 py-2 text-[12px] text-muted-foreground'>No folders</div>
//       ) : (
//         topLevelFolders.map((folder) => (
//           <button
//             key={folder.id}
//             onClick={() => handleAddToFolder(folder.id)}
//             className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
//           >
//             <FolderOpen className='size-3.5' />
//             <span className='truncate'>{folder.name}</span>
//           </button>
//         ))
//       )}
//     </motion.div>
//   );
// }

// // Context Menu for items
// function ContextMenu({
//   isOpen,
//   onClose,
//   position,
//   item,
//   type,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   position: { x: number; y: number };
//   item: TextFlowFile | TextFlowFolder;
//   type: "file" | "folder";
// }) {
//   const { deleteFile, deleteFolder, toggleStar, renameFolder, updateFile } = useTextFlowStore();
//   const [isRenaming, setIsRenaming] = useState(false);
//   const [showFolderMenu, setShowFolderMenu] = useState(false);
//   const [newName, setNewName] = useState(item.name);

//   if (!isOpen) return null;

//   const handleRename = () => {
//     if (type === "folder") {
//       renameFolder(item.id, newName);
//     } else {
//       updateFile(item.id, { name: newName });
//     }
//     setIsRenaming(false);
//     onClose();
//   };

//   const handleDelete = () => {
//     if (type === "folder") {
//       deleteFolder(item.id);
//     } else {
//       deleteFile(item.id);
//     }
//     onClose();
//   };

//   const handleStar = () => {
//     if (type === "file") {
//       toggleStar(item.id);
//     }
//     onClose();
//   };

//   return (
//     <>
//       <div className='fixed inset-0 z-40' onClick={onClose} />
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         style={{ left: position.x, top: position.y }}
//         className='fixed z-50 w-40 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
//       >
//         {isRenaming ? (
//           <div className='p-2'>
//             <input
//               type='text'
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//               className='w-full rounded bg-black/5 px-2.5 py-1.5 text-[13px] outline-none dark:bg-white/5'
//               autoFocus
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleRename();
//                 if (e.key === "Escape") setIsRenaming(false);
//               }}
//             />
//           </div>
//         ) : (
//           <>
//             <button
//               onClick={() => setIsRenaming(true)}
//               className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
//             >
//               <Edit3 className='size-3.5' />
//               Rename
//             </button>
//             {type === "file" && (
//               <>
//                 <button onClick={handleStar} className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}>
//                   <Star className='size-3.5' />
//                   {(item as TextFlowFile).starred ? "Unstar" : "Star"}
//                 </button>
//                 <button
//                   onClick={() => setShowFolderMenu(true)}
//                   className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
//                 >
//                   <FolderPlus className='size-3.5' />
//                   Add to folder
//                 </button>
//               </>
//             )}
//             <div className='my-1 h-px bg-black/5 dark:bg-white/5' />
//             <button
//               onClick={handleDelete}
//               className={`${BUTTON_STYLE} w-full text-red-500 hover:bg-red-500/10`}
//             >
//               <Trash2 className='size-3.5' />
//               Delete
//             </button>
//           </>
//         )}
//       </motion.div>

//       <AnimatePresence>
//         {showFolderMenu && (
//           <AddToFolderMenu
//             fileId={item.id}
//             onClose={() => {
//               setShowFolderMenu(false);
//               onClose();
//             }}
//             position={position}
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// // File Item with animated icon using ref for group hover
// function FileItem({ file }: { file: TextFlowFile }) {
//   const pathname = usePathname();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
//   const iconRef = useRef<BookTextIconHandle>(null);
//   const isActive = pathname === `/dashboard/document/${file.id}`;

//   const handleContextMenu = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setMenuPos({ x: e.clientX, y: e.clientY });
//     setMenuOpen(true);
//   };

//   return (
//     <>
//       <div
//         className={`group ${BUTTON_STYLE} ${isActive ? BUTTON_ACTIVE : BUTTON_HOVER}`}
//         onMouseEnter={() => iconRef.current?.startAnimation()}
//         onMouseLeave={() => iconRef.current?.stopAnimation()}
//       >
//         <Link
//           href={`/dashboard/document/${file.id}`}
//           className='flex flex-1 items-center gap-2 min-w-0'
//         >
//           <BookTextIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
//           <span className='truncate'>{file.name}</span>
//           {file.starred && <Star className='size-2.5 shrink-0 fill-amber-500 text-amber-500' />}
//         </Link>
//         <button
//           onClick={handleContextMenu}
//           className='shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
//         >
//           <MoreVertical className='size-3.5 text-muted-foreground' />
//         </button>
//       </div>
//       <AnimatePresence>
//         {menuOpen && (
//           <ContextMenu
//             isOpen={menuOpen}
//             onClose={() => setMenuOpen(false)}
//             position={menuPos}
//             item={file}
//             type='file'
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// // Folder Item with animated icon using ref for group hover
// function FolderItem({ folder }: { folder: TextFlowFolder }) {
//   const pathname = usePathname();
//   const { getFilesByFolder } = useTextFlowStore();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
//   const iconRef = useRef<FolderKanbanIconHandle>(null);

//   const files = getFilesByFolder(folder.id);
//   const isActive = pathname === `/dashboard/folder/${folder.id}`;

//   const handleContextMenu = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setMenuPos({ x: e.clientX, y: e.clientY });
//     setMenuOpen(true);
//   };

//   return (
//     <>
//       <div
//         className='group'
//         onMouseEnter={() => iconRef.current?.startAnimation()}
//         onMouseLeave={() => iconRef.current?.stopAnimation()}
//       >
//         <Link
//           href={`/dashboard/folder/${folder.id}`}
//           className={`${BUTTON_STYLE} ${isActive ? BUTTON_ACTIVE : BUTTON_HOVER}`}
//         >
//           <FolderKanbanIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
//           <span className='truncate flex-1'>{folder.name}</span>
//           <span className='text-[11px] text-muted-foreground'>{files.length}</span>
//           <button
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               handleContextMenu(e);
//             }}
//             className='shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
//           >
//             <MoreVertical className='size-3.5 text-muted-foreground' />
//           </button>
//         </Link>
//       </div>
//       <AnimatePresence>
//         {menuOpen && (
//           <ContextMenu
//             isOpen={menuOpen}
//             onClose={() => setMenuOpen(false)}
//             position={menuPos}
//             item={folder}
//             type='folder'
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// // Files Section - Shows 10 MOST RECENTLY UPDATED files (regardless of folder)
// // Now collapsible like FoldersSection
// function FilesSection() {
//   const files = useTextFlowStore((state) => state.files);
//   const [isOpen, setIsOpen] = useState(true);
//   const [showAll, setShowAll] = useState(false);

//   // Get 10 most recently updated files (regardless of folder)
//   const sortedFiles = [...files].sort(
//     (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
//   );
//   const recentFiles = sortedFiles.slice(0, 10);
//   const visibleCount = 5;
//   const hasMore = recentFiles.length > visibleCount;
//   const displayFiles = showAll ? recentFiles : recentFiles.slice(0, visibleCount);

//   if (files.length === 0) {
//     return (
//       <div className='px-2 py-3 text-center text-[12px] text-muted-foreground'>No files yet</div>
//     );
//   }

//   return (
//     <div className='relative'>
//       <div className='mb-1 flex items-center justify-between px-2'>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className='flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
//         >
//           {isOpen ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
//           Files
//         </button>
//         <span className='text-[10px] text-muted-foreground'>{files.length}</span>
//       </div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className='space-y-0.5 overflow-hidden'
//           >
//             {displayFiles.map((file) => (
//               <FileItem key={file.id} file={file} />
//             ))}
//             {hasMore && !showAll && (
//               <button
//                 onClick={() => setShowAll(true)}
//                 className='flex w-full items-center justify-center py-1.5'
//               >
//                 <motion.div
//                   animate={{ y: [0, 3, 0] }}
//                   transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//                 >
//                   <ChevronDown className='size-4 text-muted-foreground' />
//                 </motion.div>
//               </button>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // Folders Section - STAYS OPEN by default
// // Optimized to filter locally and avoid store getter re-renders
// function FoldersSection() {
//   const folders = useTextFlowStore((state) => state.folders);
//   const [isOpen, setIsOpen] = useState(true);
//   const [popoverOpen, setPopoverOpen] = useState(false);
//   const [showAll, setShowAll] = useState(false);

//   // Filter top-level folders locally
//   const topLevelFolders = folders.filter((f) => f.parentId === null);
//   const visibleCount = 5;
//   const hasMore = topLevelFolders.length > visibleCount;
//   const displayFolders = showAll ? topLevelFolders : topLevelFolders.slice(0, visibleCount);

//   return (
//     <div className='relative'>
//       <div className='mb-1 flex items-center justify-between px-2'>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className='flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
//         >
//           {isOpen ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
//           Folders
//         </button>
//         <button
//           onClick={() => setPopoverOpen(true)}
//           className='rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
//         >
//           <Plus className='size-3.5 text-muted-foreground' />
//         </button>
//       </div>

//       <AnimatePresence>
//         {popoverOpen && (
//           <AddFolderPopover isOpen={popoverOpen} onClose={() => setPopoverOpen(false)} />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className='space-y-0.5 overflow-hidden'
//           >
//             {displayFolders.map((folder) => (
//               <FolderItem key={folder.id} folder={folder} />
//             ))}
//             {hasMore && !showAll && (
//               <button
//                 onClick={() => setShowAll(true)}
//                 className='flex w-full items-center justify-center py-1.5'
//               >
//                 <motion.div
//                   animate={{ y: [0, 3, 0] }}
//                   transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//                 >
//                   <ChevronDown className='size-4 text-muted-foreground' />
//                 </motion.div>
//               </button>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

# Roadmap: Next Steps

## Overview

We will tackle the remaining frontend polish (States, Naming) before moving to the Backend Integration. Complex blocks (Kanban, etc.) are deferred until the backend foundation is solid.

---

## Phase 1: Frontend Polish & Logic (Immediate)

### 1. Document Auto-Naming

- **Goal**: When a user creates a new doc (e.g., "New(1)"), the first line of text they type should automatically become the document title.
- **Implementation**:
  - **Where**: `src/components/editor/editor.tsx`
  - **Logic**:
    - Add a listener to the editor state.
    - Extract the text content of the first block (Title/H1 or Paragraph).
    - If the current name is default (matches "New\*"), update the file name in the Store.
    - **Debounce** this action (wait 500ms after typing stops) to prevent performance hits.

### 2. UI States (Empty & Error)

- **Goal**: "All Files", "Folders", "Starred", etc. should have distinct, beautiful empty states when no content exists.
- **Implementation**:
  - **Create Components**:
    - `components/dashboard/empty-state.tsx`: Reusable component with `icon`, `title`, `description`, and `actionButton` props.
    - `components/dashboard/error-state.tsx`: Generic error display.
  - **Integrate**:
    - `src/app/dashboard/page.tsx` (All Files)
    - `src/app/dashboard/folder/[id]/page.tsx`
    - `src/app/dashboard/starred/page.tsx`
    - `src/app/dashboard/recent/page.tsx`
    - Sidebar lists (if applicable).

---

## Phase 2: Backend Integration (Next)

### 1. Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM (Type-safe queries)
- **Auth**: Supabase Auth
- **State/Fetching**: TanStack Query (React Query) + Axios (or native fetch)

### 2. Architecture Plan

- **Database Schema**:
  - `profiles` (users)
  - `folders` (hierarchy)
  - `documents` (JSON content stored in `jsonb` column)
  - `stars`, `shared_access`
- **API**:
  - Use **Next.js Server Actions** or **Route Handlers** (`app/api/...`) for secure DB access.
  - **TanStack Query** will manage the specific "loading", "error", and "success" states in the UI, replacing the current Zustand local-only arrays.

---

## Proposed Changes (Immediate)

### [NEW] [empty-state.tsx](file:///Users/seye/Seye/MAANG/TextFlow/src/components/dashboard/empty-state.tsx)

- Reusable UI for "No files here".

### [MODIFY] [editor.tsx](file:///Users/seye/Seye/MAANG/TextFlow/src/components/editor/editor.tsx)

- Add `AutoNamePlugin`.

### [MODIFY] [page.tsx](file:///Users/seye/Seye/MAANG/TextFlow/src/app/dashboard/page.tsx)

- Implement `EmptyState` when `files.length === 0`.

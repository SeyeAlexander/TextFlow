# TextFlow - Product Requirements Document

> A real-time collaborative rich-text editor inspired by Notion, built as a MAANG-worthy portfolio piece.

---

## 1. Product Vision

**TextFlow** is a block-based, real-time collaborative document editor that combines the elegance of Notion with modern web technologies. It serves as a showcase of senior frontend engineering capabilities: complex state management, CRDT-based collaboration, and polished UI/UX.

### Target Audience

- Portfolio reviewers at MAANG companies
- Hiring managers for senior frontend roles
- Developers exploring collaborative editing patterns

### Success Metrics

- Demonstrates proficiency in: React, Next.js, TypeScript, Lexical, Yjs, Supabase
- Showcases understanding of: CRDTs, real-time systems, complex state management
- Exhibits: Clean architecture, responsive design, accessibility

---

## 2. Tech Stack

| Layer            | Technology               | Purpose                             |
| ---------------- | ------------------------ | ----------------------------------- |
| **Framework**    | Next.js 14+ (App Router) | Full-stack React framework          |
| **Styling**      | Tailwind CSS             | Utility-first CSS                   |
| **Components**   | Shadcn/ui                | Accessible, customizable components |
| **Rich Text**    | Lexical                  | Block-based editor framework        |
| **CRDT/Collab**  | Yjs + @lexical/yjs       | Conflict-free real-time sync        |
| **State**        | Zustand                  | Client state management             |
| **Server State** | TanStack Query           | Data fetching & caching             |
| **Database**     | Supabase (PostgreSQL)    | Managed Postgres + Auth + Realtime  |
| **ORM**          | Drizzle                  | Type-safe SQL queries               |
| **Storage**      | Supabase Storage         | File uploads (images, videos)       |

---

## 3. Architecture Overview

### Real-Time Collaboration Model

```
┌─────────────────────────────────────────────────────────────┐
│                     User A's Browser                        │
│  ┌───────────┐    ┌─────────┐    ┌──────────────────────┐  │
│  │  Lexical  │◄──►│   Yjs   │◄──►│  Supabase Realtime   │  │
│  │  Editor   │    │ Y.Doc   │    │  (Broadcast Channel) │  │
│  └───────────┘    └─────────┘    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ WebSocket (Binary Yjs Updates)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                             │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐ │
│  │  Realtime/PubSub │  │   PostgreSQL   │  │   Storage   │ │
│  │  (Broadcast)     │  │  (Persistence) │  │  (Assets)   │ │
│  └──────────────────┘  └────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Keystroke** → Lexical updates → Yjs generates binary delta
2. **Broadcast** → Delta sent via Supabase Realtime to all peers
3. **Merge** → Remote Yjs applies delta, Lexical re-renders
4. **Persist** → Debounced save of Yjs state to PostgreSQL

---

## 4. Database Schema

### Core Tables

```sql
-- User profiles (extends Supabase auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Documents (pages)
documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id),
  title TEXT DEFAULT 'Untitled',
  yjs_state BYTEA,                    -- Binary Yjs document state
  content JSONB,                       -- Lexical JSON snapshot (for search/preview)
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_by UUID REFERENCES profiles(id)
)

-- Document sharing (junction table)
document_collaborators (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'comment', 'edit')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (document_id, user_id)
)

-- Comments on documents
comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  block_id TEXT,                       -- Lexical block anchor
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Chat messages (scoped to documents)
chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Uploaded assets
assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  uploader_id UUID REFERENCES profiles(id),
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Key Insight: Page = 1 Row

- Each document is **ONE row** in `documents`
- All blocks are stored within `yjs_state` (binary) or `content` (JSON)
- No per-block rows — Yjs handles block structure internally
- This simplifies sync and avoids complex relational queries

---

## 5. Collaboration Limits

### Research: Concurrent Collaborators

| Platform    | Max Concurrent Editors |
| ----------- | ---------------------- |
| Notion      | ~50 (soft limit)       |
| Google Docs | ~100 (officially)      |
| Figma       | ~500 (enterprise)      |

**TextFlow Target**: 3-5 concurrent editors per document (portfolio scope)

- Supabase Realtime handles this easily
- Yjs performs well with small groups
- Can scale with proper provider architecture

---

## 6. UI/UX Design System

### Color Palette

| Token              | Light Mode | Dark Mode | Usage            |
| ------------------ | ---------- | --------- | ---------------- |
| `--bg-primary`     | `#FAFAFA`  | `#0F0F0F` | Main background  |
| `--bg-secondary`   | `#F4F4F5`  | `#18181B` | Sidebar, cards   |
| `--bg-elevated`    | `#FFFFFF`  | `#1C1C1E` | Modals, tooltips |
| `--text-primary`   | `#09090B`  | `#FAFAFA` | Body text        |
| `--text-secondary` | `#71717A`  | `#A1A1AA` | Muted text       |
| `--accent`         | `#3B82F6`  | `#60A5FA` | Primary actions  |
| `--success`        | `#10B981`  | `#34D399` | Success states   |
| `--warning`        | `#F59E0B`  | `#FBBF24` | Warnings         |
| `--destructive`    | `#EF4444`  | `#F87171` | Errors, delete   |

> **Note**: Not pure white/black — slightly tinted for reduced eye strain.

### Typography

- **Font**: Inter (Google Fonts)
- **Scale**: 12/14/16/18/24/32/48px
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing & Layout

- **Grid**: 8px base unit
- **Border radius**: 6px (subtle), 8px (cards), 12px (modals)
- **Shadows**: Multi-layer for depth (Tailwind's shadow-sm, shadow-md)
- **Animations**: 150-300ms ease-out (fast, snappy)

### Core Principles

1. **Minimalist**: Chrome fades when editing; content is king
2. **Consistent**: Same patterns for buttons, inputs, modals
3. **Accessible**: WCAG AA contrast, keyboard navigation, ARIA
4. **Responsive**: Mobile-first; collapsible sidebar on smaller screens

---

## 7. Application Structure

### Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Doc Title (editable) | Collaborators | Share│
├──────────────┬──────────────────────────┬───────────────────┤
│  Sidebar     │     Main Editor Area     │   Right Panel     │
│  (240px)     │     (flex-1)             │   (320px)         │
│              │                          │                   │
│  • Search    │   ┌──────────────────┐   │  • Comments       │
│  • Private   │   │  Block Editor    │   │  • AI Assistant   │
│  • Shared    │   │  (Lexical)       │   │  • Version Hist   │
│  • Favorites │   │                  │   │  • Chat (collab)  │
│  • Trash     │   │  / Slash cmds    │   │                   │
│              │   │  Cursors shown   │   │                   │
│  • Settings  │   └──────────────────┘   │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

### Pages & Routes

| Route                | Description           |
| -------------------- | --------------------- |
| `/`                  | Landing page (public) |
| `/login`             | Login form            |
| `/signup`            | Registration form     |
| `/onboarding`        | Post-signup setup     |
| `/dashboard`         | Main app shell        |
| `/dashboard/[docId]` | Document editor       |
| `/settings`          | User preferences      |

---

## 8. Implementation Phases

### Phase 0: UI Foundation (Current)

**Goal**: Beautiful, responsive UI shell with basic Lexical integration.

#### Deliverables

- [ ] Next.js project with App Router
- [ ] Tailwind + Shadcn/ui setup
- [ ] Design tokens (CSS variables)
- [ ] Login page (split layout: form + hero)
- [ ] Dashboard shell (sidebar + main area)
- [ ] Basic Lexical editor (paragraph only)
- [ ] Light/Dark theme toggle

**No backend — all mocked data.**

---

### Phase 1: Core Editor Functionality

**Goal**: Fully functional single-user editor.

#### Features

- [ ] Block types: Paragraph, H1-H3, Lists, Quote, Code
- [ ] Slash command menu (`/heading`, `/list`, etc.)
- [ ] Floating toolbar (bold, italic, link)
- [ ] Undo/Redo (History plugin)
- [ ] Block drag & drop
- [ ] Serialization to JSON (localStorage save)

---

### Phase 2: Authentication & Persistence

**Goal**: Users can sign in and save documents.

#### Features

- [ ] Supabase Auth (email + OAuth)
- [ ] Drizzle schema setup & migrations
- [ ] Document CRUD (create, list, load, save, delete)
- [ ] Debounced auto-save
- [ ] Protected routes

---

### Phase 3: Real-Time Collaboration

**Goal**: Multiple users edit simultaneously.

#### Features

- [ ] Yjs integration with Lexical
- [ ] Supabase Realtime provider
- [ ] Remote cursor rendering
- [ ] Presence indicators (avatar pile)
- [ ] Conflict-free merging

---

### Phase 4: Sharing & Permissions

**Goal**: Invite collaborators with role-based access.

#### Features

- [ ] Share modal (search users, set permissions)
- [ ] RLS policies for view/comment/edit
- [ ] "Shared with me" section
- [ ] Link sharing (public toggle)

---

### Phase 5: Comments

**Goal**: Contextual discussions on document content.

#### Features

- [ ] Comment anchoring to blocks
- [ ] Thread replies
- [ ] @mentions
- [ ] Resolve/unresolve
- [ ] Real-time sync

---

### Phase 6: Chat

**Goal**: Real-time messaging between collaborators.

#### Features

- [ ] Chat panel (WhatsApp-style)
- [ ] Document-scoped rooms
- [ ] Message history
- [ ] Typing indicators
- [ ] Unread badges

---

### Phase 7: AI Ideas

**Goal**: AI-powered content suggestions.

#### Features

- [ ] AI chat modal
- [ ] Edge Function for LLM API
- [ ] Context-aware prompts
- [ ] Copy-to-editor functionality

---

### Phase 8: Advanced Editor

**Goal**: Rich content beyond text.

#### Features

- [ ] Image upload (Supabase Storage)
- [ ] Video embeds (YouTube/Vimeo)
- [ ] Tables (rows, columns, cells)
- [ ] Focus mode
- [ ] Basic version history

---

### Phase 9: Polish & Deploy

**Goal**: Production-ready application.

#### Tasks

- [ ] Performance optimization
- [ ] Error boundaries & logging
- [ ] Accessibility audit
- [ ] E2E tests (Playwright)
- [ ] Vercel deployment

---

## 9. Key Technical Decisions

### Why Yjs over OT?

| Factor              | Yjs (CRDT)                      | OT                |
| ------------------- | ------------------------------- | ----------------- |
| Conflict resolution | Automatic, offline-friendly     | Requires server   |
| Complexity          | Higher upfront                  | Lower initially   |
| Scalability         | Peer-to-peer capable            | Server bottleneck |
| Portfolio value     | Demonstrates advanced knowledge | Common approach   |

**Decision**: Yjs for MAANG-worthy technical depth.

### Why Page = 1 Row (not Block = 1 Row)?

- **Block-per-row** requires complex SQL joins for every render
- **Yjs handles** block structure internally with superior performance
- **Simpler syncing**: One binary blob per document
- **Transclusion** (block embedding) can be added later if needed

### Why Supabase?

- Managed Postgres with RLS
- Built-in Auth, Realtime, Storage
- Generous free tier for prototyping
- Edge Functions for serverless API

---

## 10. Best Practices Applied

### React/Next.js

- Server Components by default
- `"use client"` only when needed (interactivity, hooks)
- Proper code splitting with dynamic imports
- Image optimization with `next/image`

### TypeScript

- Strict mode enabled
- Explicit return types for functions
- Zod for runtime validation
- Discriminated unions for state

### Styling

- CSS variables for theming
- Tailwind for rapid development
- Component variants with `cva` (class-variance-authority)
- No inline styles

### Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<article>`)
- ARIA labels for interactive elements
- Focus management for modals
- Keyboard navigation throughout

### Testing (Future)

- Unit tests: Vitest
- E2E tests: Playwright
- Component tests: React Testing Library

---

## 11. Appendix

### Notion/Google Docs Feature Comparison

| Feature          | Notion | Google Docs  | TextFlow |
| ---------------- | ------ | ------------ | -------- |
| Block-based      | ✅     | ❌           | ✅       |
| Real-time collab | ✅     | ✅           | ✅       |
| Comments         | ✅     | ✅           | ✅       |
| Chat             | ❌     | ✅ (sidebar) | ✅       |
| AI assist        | ✅     | ✅           | ✅       |
| Offline          | ✅     | ✅           | 🔜       |
| Tables           | ✅     | ✅           | 🔜       |
| Databases        | ✅     | ❌           | ❌       |

---

_Document Version: 1.0_  
_Last Updated: 2026-01-23_

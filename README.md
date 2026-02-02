# TextFlow

TextFlow is a modern, collaborative document editing platform built with **Next.js 15 (App Router)** and **Supabase**.

## Tech Stack

### Core

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Editor**: Lexical (Facebook's Extensible Text Editor)

### Backend & Data (Phase 2+)

- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth (SSR w/ Cookies)
- **Data Fetching**: TanStack Query v5 (React Query)
- **Realtime**: Supabase Realtime (Channels)

## Getting Started

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env.local` file with your Supabase credentials:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Architecture Highlights

- **"UI First" Development**: The dashboard and editor UI were fully polished using local state (Zustand) before backend integration.
- **Hybrid State Management**:
  - _Server State_ (Files, Folders): Managed by TanStack Query & Server Actions.
  - _Client UI State_ (Modals, Sidebar): Managed by Zustand.
- **Collaborative Editing**: Uses Yjs (CRDTs) with a "Broadcast First, Save Later" strategy for performance.

## Project Structure

- `/src/app`: Next.js App Router pages (Server Components).
- `/src/components`: Reusable UI components (shadcn/ui, custom).
- `/src/db`: Drizzle Schema and DB connection.
- `/src/actions`: Server Actions for data mutations.
- `/src/store`: Client-side UI stores (Zustand).
- `/src/utils`: Supabase clients and helpers.

# Frontend Implementation Plan — Customer Health Overview Page

## A. High-Level Estimation

Assuming designs are available and APIs behave as documented, I would estimate frontend delivery of this feature at **~1–3 days**.

**Rough breakdown:**
- Page structure and table scaffold: ~0.5 day  
- Data fetching, server-side pagination, filters/search: ~0.5–1 day  
- Customer details drawer + full detail route: ~0.5–1 day  
- Loading, error, and empty states + polish: ~0.5 day  

This estimate includes time for iteration and UX refinement, with a small buffer for edge cases, but excludes backend work.

---

## B. Architecture & Folder Structure

The implementation follows **Next.js App Router** conventions with a clear separation between routing logic and reusable UI components.

### App Router Structure

```text
app/
└── customers/
    ├── page.tsx                 # Server Component — fetches list via searchParams
    ├── loading.tsx              # Table skeleton (Suspense boundary)
    ├── error.tsx                # Route-level error UI
    └── [id]/
        ├── page.tsx             # Server Component — full customer detail
        ├── loading.tsx          # Detail page skeleton
        └── error.tsx
```

### Component Structure

```text
components/customers/
├── customer-table.tsx           # Server — renders table rows from data
├── customer-row.tsx             # Server — individual row with click handler
├── health-badge.tsx             # Shared — color-coded status indicator
├── filters-toolbar.tsx          # Client — search input, sort, filter dropdowns
└── customer-detail-drawer.tsx   # Client — side panel (Sheet) for quick peek
```

This structure keeps routing concerns inside the `app/` directory while allowing customer-specific UI logic to live in a dedicated, reusable component namespace.

---

## C. Page & Component Responsibilities

### `/customers` — Customer Health Overview Page

- `page.tsx` (Server Component)
  - Fetches paginated customer data using `searchParams`
  - Renders the table shell and passes data down
- `loading.tsx`
  - Displays a table skeleton while data loads
- `error.tsx`
  - Handles unexpected route-level failures gracefully

**Key interactions:**
- Search, filter, and sort via `filters-toolbar`
- Row click opens `customer-detail-drawer`
- Drawer includes CTA to navigate to full detail page

---

### `/customers/[id]` — Customer Health Detail Page

- `page.tsx` (Server Component)
  - Fetches full health data for a single customer
- `loading.tsx`
  - Skeleton layout for charts and metrics
- `error.tsx`
  - Fallback UI for failed detail fetches

This page is designed for deeper investigation, with more space for historical data, trends, and notes.

---

## D. Data Fetching & State Management

- **Customer list**
  - Server-side pagination for scalability
  - URL-driven state (search, filters, sort, page)
  - Enables bookmarking, sharing, and browser navigation

- **Customer details**
  - Loaded on demand when opening the drawer or detail page
  - Cached client-side to avoid unnecessary refetching

- **State tools**
  - Server Components for initial data load
  - Client Components for UI state and interactions
  - Optional TanStack Query for caching and request lifecycle management

---

## E. UX Decisions & Rationale

- **Drawer-first interaction**
  - Allows quick inspection without losing table context
  - Ideal for scanning multiple customers efficiently
- **Full detail page**
  - Accessible via a clear CTA inside the drawer
  - Supports deeper analysis without UI constraints
- **Loading states**
  - Skeletons preferred over spinners for perceived performance
- **Edge cases handled**
  - Empty result sets
  - Partial or missing health data
  - Network failures and slow responses

---

## F. Task Breakdown

1. Set up routing and base page layout  
2. Implement table shell and server-side data fetching  
3. Add filters, sorting, and pagination controls  
4. Implement customer detail drawer  
5. Add full customer detail page  
6. Handle loading, error, and empty states  
7. UX polish and basic accessibility checks  

---

## Closing Notes

The goal of this implementation is to support fast triage and confident decision-making for CSMs. The architecture favors clarity, scalability, and incremental delivery, while leaving room for future enhancements without introducing unnecessary complexity.

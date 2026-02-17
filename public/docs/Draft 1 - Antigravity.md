# Customer Health Overview Page — Frontend Implementation Plan

## A. High-Level Estimation

I estimate **2–3 days** to deliver this feature production-ready, assuming designs are available.

| Phase | Scope                                                                   | Time  |
| ----- | ----------------------------------------------------------------------- | ----- |
| Day 1 | Route setup, API layer, table with server-side pagination               | ~8h   |
| Day 2 | Filters, search, sorting (URL-synced), detail drawer + full detail page | ~8h   |
| Day 3 | Edge cases, loading/error/empty states, polish, accessibility pass      | ~4–6h |

This estimate assumes I can sync with the designer early on the drawer vs. full-page detail layout, as that decision impacts the component structure. If a Figma MCP integration is available, the UI build phase can be accelerated significantly.

---

## B. Architecture & Component Structure

### Routing

Using the **Next.js App Router**:

- `/customers` — Main list page. `searchParams` drive the table state (page, search, filters, sort), making the view shareable and bookmark-friendly.
- `/customers/[id]` — Dedicated detail page for deep analysis (overview cards, charts, event history).

### Component Breakdown

```
app/
└── customers/
    ├── page.tsx                 # Server Component — fetches list via searchParams
    ├── loading.tsx              # Table skeleton (Suspense boundary)
    ├── error.tsx                # Route-level error UI
    └── [id]/
        ├── page.tsx             # Server Component — full customer detail
        ├── loading.tsx          # Detail page skeleton
        └── error.tsx

components/customers/
├── customer-table.tsx           # Server — renders table rows from data
├── customer-row.tsx             # Server — individual row with click handler
├── health-badge.tsx             # Shared — color-coded status indicator
├── filters-toolbar.tsx          # Client — search input, sort, filter dropdowns
└── customer-detail-drawer.tsx   # Client — side panel (Sheet) for quick peek
```

### Server vs. Client Components

- **Server** (`page.tsx`, `customer-table.tsx`): Initial data fetch happens server-side — reduces client bundle, eliminates fetch waterfalls, and the HTML arrives with data already rendered.
- **Client** (`filters-toolbar.tsx`, `customer-detail-drawer.tsx`): Interactive elements that respond to user input and manage ephemeral UI state.

### Progressive Detail Disclosure

When a CSM clicks a row, a **Sheet/Drawer** (shadcn `<Sheet>`) slides in from the right — rounded corners, with breathing room (margin on all sides) for a clean, non-claustrophobic feel. This gives a quick glance: health score, MRR, last active, recent notes.

At the top-right of the drawer, a **"View Full Profile →"** button navigates to `/customers/[id]` — a dedicated page with color-coded overview cards, usage trend charts (Recharts), and a table of recent events. The drawer is the "quick peek"; the full page is the "deep dive."

This wasn't explicitly in the brief, but in my experience users often need both fast triage and deep analysis, and forcing everything into a side panel creates a cramped experience.

### Stack Choices

shadcn/ui (Table, Sheet, Select, Input, Badge, Pagination), Framer Motion for smooth panel transitions (components shouldn't snap in/out), Recharts for usage trend visualizations.

---

## C. Data Fetching & State Management

### Paginated List (Server-Side)

Standard Next.js `fetch` inside the Server Component. The list "state" (page number, sort, search query, segment filter) lives entirely in **URL search params** — not React state. This is a single source of truth that survives refresh, is shareable, and works without client-side JavaScript.

### Customer Details (Client-Side — TanStack Query)

The drawer and detail page use TanStack Query via a `useCustomerDetail(id)` hook. TanStack Query handles caching (if a CSM closes a panel and reopens it, data is instant), retry logic, and independent loading/error states per panel.

I'd set up a root `providers.tsx` with QueryClientProvider configured with sensible defaults: `staleTime: 5min`, `retry: 2`, `refetchOnWindowFocus: false` (customer data doesn't change every second). API functions live in `lib/api/customers.ts`, hooks in `hooks/use-customers.ts` — separation keeps things testable.

### Loading & Error States

- **Table:** `loading.tsx` renders a skeleton that mimics the table structure — prevents layout shift, feels faster than a spinner.
- **Drawer/Detail:** Per-component skeletons within the panel while data loads.
- **Errors:** `error.tsx` boundary for route-level failures. Within the drawer, a contextual error alert with a "Retry" button — no full-page reload needed.
- **Empty:** A clear empty-state component with a "Clear Filters" CTA when no results match. Reusable across routes via props (title, subtitle, icon, CTA).

---

## D. UX Details & Edge Cases

### Slow Networks

I'd wrap filter/pagination navigations in `useTransition`, so current data stays visible (slightly dimmed) while the next batch loads — no blank screen flash.

### Search

Debounced at 300–500ms using `router.replace` (not `push`) to avoid polluting browser history with every keystroke.

### Sorting

Columns sortable by Health Score, MRR (numeric), Last Active (date), Owner/Name (alphabetical). Clicking a header toggles `asc → desc → none`, updating `?sort=mrr&order=desc`. Visual chevron indicators on the active column.

### Filter Design

Beyond the basic health segment dropdown, I'd discuss with the designer whether we need compound filters (e.g., "At Risk AND MRR > $10k") since CSMs at scale need to prioritize high-value at-risk accounts. Even if V1 is simple, the URL param structure should support future compound filters.

### Scroll Preservation

Pagination uses `router.push` with `{ scroll: false }` to prevent viewport jumping when changing pages.

### Edge Cases

1. **Zero results:** Empty state with "Clear Filters" CTA.
2. **Pagination bounds:** Disable Previous on page 1, Next on last page. Validate page param server-side.
3. **Race conditions:** Clicking Customer A → then immediately B. TanStack Query's keyed queries ensure A's data never renders in B's panel.
4. **Stale tab data:** If a CSM leaves the tab open for hours, a subtle "Data may be outdated — refresh" banner appears.
5. **Responsive:** Table columns collapse on smaller screens; consider a card-list view for mobile.

---

## E. Task Breakdown

I prefer a **vertical slice** approach — each slice is demo-able, rather than building all UI first:

| #   | Task                                                                          | Est. |
| --- | ----------------------------------------------------------------------------- | ---- |
| 1   | Route setup (`/customers`, `/customers/[id]`), typed API functions, mock data | 2h   |
| 2   | Table shell + server-side pagination — wired end-to-end                       | 3h   |
| 3   | Filters toolbar + debounced search — synced to URL params                     | 2h   |
| 4   | Sorting (column headers ↔ URL)                                                | 1h   |
| 5   | Detail drawer (Sheet) — row click triggers `?selectedId`, TanStack fetch      | 3h   |
| 6   | Full detail page (`/customers/[id]`) — overview cards, charts, event table    | 3h   |
| 7   | Skeletons, error/empty states, accessibility (keyboard nav, focus trap)       | 2h   |

Each ticket is a shippable increment — the feature is reviewable and testable at every stage.

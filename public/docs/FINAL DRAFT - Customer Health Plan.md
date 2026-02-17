# Customer Health Overview Page — Frontend Implementation Plan

## A. High-Level Estimation

I'd estimate **2–3 days** to deliver this feature production-ready, assuming designs are finalized and APIs behave as documented.

| Phase | Scope                                                                          | Time  |
| ----- | ------------------------------------------------------------------------------ | ----- |
| Day 1 | Route setup, API layer, table with server-side pagination, filters and sorting | ~6–8h |
| Day 2 | Detail drawer, full detail page route, TanStack Query integration              | ~6–8h |
| Day 3 | Loading/error/empty states, motion polish, edge cases, accessibility           | ~4–6h |

This estimate includes buffer for iteration. I'd want to sync with the designer early on the drawer vs. full-page layout, since that decision shapes the component structure. If Figma-to-code tooling is available, Day 1 could compress significantly.

**Milestones:**

- **M1 — Core table is functional** (end of Day 1): A CSM can open the page, see paginated customer data, search, filter by health segment, and sort columns. This is the core value delivered.
- **M2 — Detail views are wired** (end of Day 2): Clicking a row opens the drawer with real data. The full detail page is navigable and populated. Feature is functionally complete.
- **M3 — Production-ready** (end of Day 3): All edge cases handled, loading/error states polished, transitions smooth, accessibility checked. Ready for QA sign-off.

**Key dependencies:** finalized designs, API endpoint availability, and design system documentation.

---

## B. Architecture & Component Structure

### Route Structure (App Router)

```
app/
├── (dashboard)/
│   ├── layout.tsx                       # Shared layout with sidebar
│   └── customer-health/
│       ├── page.tsx                     # Server Component — fetches list via searchParams
│       ├── loading.tsx                  # Table skeleton (Suspense boundary)
│       ├── error.tsx                    # Route-level error UI
│       └── [customerId]/
│           ├── page.tsx                 # Server Component — full customer detail
│           ├── loading.tsx              # Detail page skeleton
│           └── error.tsx
```

### Component Breakdown

```
components/customers/
├── customer-health-table.tsx            # Client — table with sorting controls
├── customer-row.tsx                     # Client — individual row with click handler
├── health-badge.tsx                     # Shared — color-coded status indicator
├── filters-toolbar.tsx                  # Client — search input, filter/sort dropdowns
├── customer-detail-drawer.tsx           # Client — side panel (Sheet) for quick peek
├── overview-cards.tsx                   # Shared — metric cards for detail page
└── empty-state.tsx                      # Shared — configurable empty/error state
```

This structure keeps routing concerns inside `app/` while customer-specific UI lives in a dedicated, reusable component namespace.

### Server vs. Client Component Strategy

- **Server Components** (`page.tsx` files): Handle initial data fetching. This reduces the client bundle, eliminates fetch waterfalls, and means the HTML arrives with data already rendered. The list page and full detail page are both server-rendered because their content is primarily data-driven, not interactive.
- **Client Components** (toolbar, drawer, row click handlers): Used for interactive elements — search input, filter dropdowns, drawer open/close, and chart libraries that need the DOM.

### Progressive Detail Disclosure

The spec mentions "right-side panel (or route)" — I'm proposing **both**, because CSMs often need fast triage _and_ deep analysis:

**Quick View Drawer (primary interaction):** When a CSM clicks a row, a Sheet (shadcn `<Sheet>`) slides in from the right with rounded corners and breathing room (margin on all sides) so it feels intentional, not full-screen. This shows the essentials: health score, MRR, last active, recent notes. The CSM can scan several customers without ever leaving the table.

**Full Detail Page (for deeper analysis):** A "View Full Details →" button at the top-right of the drawer navigates to `/customer-health/[customerId]`. This page has room for color-coded overview cards (4 metrics: MRR, Usage %, Last Activity, Health Score), usage trend charts (Recharts — line/area), and a recent events table. It's also a shareable URL.

**Charts live on the detail page only.** Keeping the list view lightweight means it loads fast even with large datasets, while the detail page can afford heavier visuals.

### Stack

shadcn/ui (Table, Sheet, Select, Input, Badge, Pagination), Framer Motion for smooth drawer transitions and subtle row hover effects (components shouldn't snap in/out), Recharts for usage trend charts on the detail page.

---

## C. Data Fetching & State Management

### Paginated Customer List (Server-Side)

The list page uses standard Next.js `fetch` inside the Server Component. All list "state" — page number, sort order, search query, segment filter — lives entirely in **URL search params**, not React state. This is a single source of truth that survives refresh, supports the back button correctly, and lets CSMs share links like "show me all At Risk customers sorted by MRR."

Pagination is server-side — fetching 10 results per page by default, with an option for the user to increase to 20 or 30. Fetching all records and paginating client-side is a non-starter for large datasets.

### Customer Health Details (Client-Side — TanStack Query)

The drawer uses TanStack Query via a `useCustomerHealth(customerId)` hook. This gives us caching (if a CSM closes a drawer and reopens the same customer, data is instant), automatic retry logic, and independent loading/error states that don't affect the main table.

I'd set up a root `providers.tsx` with QueryClientProvider and sensible defaults (stale time, retry on 5xx only, no refetch on window focus). API functions in `lib/api/customers.ts`, hooks in `hooks/use-customers.ts` — separation keeps things testable.

### Loading, Error & Empty States

- **Table loading:** `loading.tsx` renders a skeleton mimicking the table structure — prevents layout shift, feels faster than a spinner.
- **Drawer loading:** Per-component skeleton within the panel while data fetches, driven by TanStack Query's `isLoading`.
- **Errors:** `error.tsx` boundary for route-level failures. Within the drawer, a contextual error alert with a "Retry" button — no full-page reload needed.
- **Empty results:** A reusable `EmptyState` component (configurable via props: title, subtitle, icon, CTAs like "Clear Filters" or "Go back"). Used across both routes.

---

## D. UX Details & Edge Cases

### Slow Networks

I'd wrap filter/pagination navigations in `useTransition`, so current data stays visible (slightly dimmed) while the next batch loads — no blank screen flash. The drawer loads independently from the list, so a slow detail fetch never blocks the table.

### Search

Debounced at 300ms using `router.replace` (not `push`) to avoid polluting browser history with every keystroke.

### Sorting

Columns sortable by Health Score, MRR (numeric), Last Active (date), Owner/Name (alphabetical). Clicking a header toggles `asc → desc → none`, reflected in the URL as `?sort=mrr&order=desc`. Visual chevron indicators on the active column.

### Filter Design

Health segment dropdown (Healthy / Watch / At Risk) as the baseline. Even if V1 is simple, I'd structure the URL params to support future compound filters (e.g., "At Risk AND MRR > $10k") without refactoring.

### Scroll Preservation

Pagination uses `router.push` with `{ scroll: false }` to prevent viewport jumping when changing pages.

### Edge Cases

1. **Empty results after filtering:** Clear empty state with "No customers found" message and a "Clear Filters" button.
2. **Pagination + filter interaction:** User is on page 10, applies a filter that returns 1 page — auto-reset to page 1 when filters change. Show "Showing 1–10 of 45 results (filtered)."
3. **Race conditions:** Clicking Customer A then immediately Customer B. TanStack Query's keyed queries ensure A's data never renders in B's panel. In-flight requests cancel on unmount.
4. **Missing data:** Handle null `lastActive`, `owner`, or `healthScore` gracefully — show dashes or "N/A" instead of crashing.
5. **Very long customer names:** Truncate with tooltip on hover.
6. **Stale tab data:** If a CSM leaves the tab open for hours, a subtle "Data may be outdated — refresh" banner appears.
7. **Detail fetch fails but list still usable:** The drawer shows its own error state; the table remains fully functional.

---

## E. Task Breakdown

I prefer a **vertical slice** approach — each task is shippable and demo-able, rather than building all UI first and wiring data later. Each of these can be broken into individual tickets on a board like Linear or ClickUp:

1. **Route setup, API layer, and core table** — Set up both routes with loading/error boundaries. Build the table with server-side pagination, filters toolbar (debounced search, segment dropdown), and column sorting — all synced to URL params. Wire to the real API. _(~6–8h)_

2. **Detail drawer and data integration** — Build the shadcn Sheet triggered by row click. Set up TanStack Query provider and `useCustomerHealth` hook. Populate the drawer with essential customer info and add the "View Full Details →" link. _(~3–4h)_

3. **Full detail page** — Build `/customer-health/[customerId]` with overview cards, Recharts usage trend charts, and a recent events table. _(~3h)_

4. **Polish and edge cases** — Loading skeletons (table + drawer + detail page), error/empty states with retry CTAs, Framer Motion transitions, pagination edge cases, accessibility pass (keyboard nav, focus trap, ARIA labels). _(~3–4h)_

---

## Closing

The goal of this implementation is to support fast triage and confident decision-making for CSMs. The architecture favors clarity, incremental delivery, and real-world resilience — each day ends with something shippable. I'm happy to walk through any of this in more detail.

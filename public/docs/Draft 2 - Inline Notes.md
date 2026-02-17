# Customer Health Overview – Frontend Plan

## A. High‑Level Estimate

1–3 days depending on final design scope.
I'd prioritize the list + filtering + pagination first, then the drawer details, then the full detail page.

## B. Architecture & Component Structure

### Routes (App Router)

- page.tsx
- loading.tsx
- error.tsx
- page.tsx
- Optional: parallel route for drawer with page.tsx

### Components

- CustomerHealthPage (server)
- CustomerHealthToolbar (client: search/filter/sort)
- CustomerTable (server)
- CustomerRow (client: row click)
- HealthBadge
- CustomerDetailsDrawer (client + React Query)
- CustomerDetailsPage (server)
- UsageChart, RecentEventsList, NotesPanel

### My product decisions (to avoid "generic" feel)

- Drawer first, full detail page second
- Drawer spacing with margins
- Charts on detail page only
- Subtle motion with Framer Motion

### Server vs Client Components

- Server: list page, table shell, full detail page
- Client: toolbar, row click, drawer open/close, chart libs

## C. Data Fetching & State Management

### List (server)

Read searchParams and call GET /api/customers

### Detail (drawer)

Use React Query for GET /api/customers/{id}/health on click.

### Loading + Error + Empty

- loading.tsx for full list skeleton
- Drawer skeleton for isLoading
- Empty state with CTA
- Error handling: retry on 5xx, no retry on 4xx

## D. UX Details & Edge Cases

- Slow network: SSR list + skeletons
- URL state for shareable URLs
- Scroll preservation with scroll={false}
- Edge cases: empty results, missing data, page out of range, long names, detail fetch fails

## E. Task Breakdown

1-10 numbered tasks from route setup through QA

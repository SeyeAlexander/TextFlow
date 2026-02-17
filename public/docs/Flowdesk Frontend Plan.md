# Frontend Implementation Plan: Customer Health Overview Page

## A. High-Level Estimation

**Timeline: 1.5 - 3 days**

- **Day 1 (6-8 hours)**: Core dashboard UI, table structure, pagination, filtering/sorting
- **Day 2 (4-6 hours)**: Detail drawer/sheet component, API integration, state management
- **Day 3 (2-4 hours)**: Detail page route, polish, edge cases, testing

*Note: Timeline assumes designs are finalized. If Figma-to-code tooling (e.g., Figma MCP) is available, Day 1 could be compressed to 4-6 hours.*

**Key Dependencies:**
- Finalized designs/mockups
- API endpoint availability for testing
- Design system component library documentation

---

## B. Architecture & Component Structure

### Route Structure
```
app/
├── (dashboard)/
│   ├── layout.tsx                    # Shared layout with sidebar
│   ├── customer-health/
│   │   ├── page.tsx                  # Main dashboard (Server Component)
│   │   ├── loading.tsx               # Page-level loading UI
│   │   └── [customerId]/
│   │       ├── page.tsx              # Detail page route (Server Component)
│   │       └── loading.tsx           # Detail page loading UI
│   └── error.tsx                     # Global error boundary
```

### Component Breakdown

**Server Components** (data fetching, no interactivity):
- `CustomerHealthPage` - Main page wrapper, handles initial data fetch
- `CustomerDetailPage` - Full detail page with overview cards, charts, events

**Client Components** (interactivity, state):
- `CustomerHealthTable` - Table with sorting/filtering controls
- `CustomerRow` - Individual row (click handler for drawer)
- `CustomerDetailsDrawer` - Slide-out panel (shadcn Sheet)
- `DashboardActions` - Search input, filter/sort controls
- `HealthBadge` - Status indicator (Healthy/Watch/At Risk)
- `PaginationControls` - Server-side pagination UI

**Shared/Utility Components:**
- `EmptyState` - Configurable empty/error state component
- `TableSkeleton` - Loading skeleton for table
- `OverviewCards` - Metric cards for detail view

### Server vs Client Component Strategy

**Server Components for:**
- Initial page shell and data fetching (`page.tsx`)
- Reduces bundle size, leverages Next.js data caching
- SEO-friendly for customer detail pages

**Client Components for:**
- Interactive elements (search, filters, sorting, drawer)
- TanStack Query integration for client-side data fetching
- Real-time updates and optimistic UI

### Design Decision: Drawer vs. Full Page

The spec mentions "right-side panel (or route)" for customer details. I'm proposing **both**:

**Quick View Drawer** (Primary):
- Opens instantly on row click using shadcn Sheet component
- Shows essential info: recent events, usage trends, notes
- Allows CSMs to quickly scan multiple customers without losing context
- Clean UI with rounded corners, proper spacing (margin on all sides for that polished look)

**Full Detail Page** (Secondary):
- "View Full Details" button prominently placed in drawer (top-right corner)
- Dedicated route at `/customer-health/[customerId]`
- Comprehensive view with overview cards, charts (Recharts), detailed event tables
- Shareable URL for collaboration

**Why both?** CSMs often need to triage quickly (drawer), but some customers need deeper analysis (full page). This gives them flexibility without cluttering the main dashboard.

---

## C. Data Fetching & State Management

### Tech Stack
- **TanStack Query v5** - Client-side data fetching, caching, and state management
- **Next.js API Routes** - Proxy layer for backend APIs (handles cookies, auth tokens)
- **Axios** - HTTP client with retry logic and interceptors

### Why This Stack?
- TanStack Query provides excellent caching, automatic refetching, and loading states
- Next.js API routes enable secure cookie-based auth (httpOnly cookies)
- Axios allows centralized error handling, retries, and timeout configuration

### Next.js API Routes as Proxy Layer

You might wonder: "Why not call the backend directly from the client?"

**My reasoning:**
- **Security**: httpOnly cookies for auth tokens (no XSS exposure)
- **Flexibility**: Centralize retry logic, timeout configs, error normalization
- **DX**: TanStack Query + Next.js API routes = seamless integration

The `/api/customers` endpoint becomes:
```typescript
// app/api/customers/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Forward to backend with auth headers from cookies
  const response = await backendAPI.get('/customers', { 
    params: Object.fromEntries(searchParams) 
  });
  return Response.json(response.data);
}
```

This keeps client code clean while handling auth/retries at the API layer.

### Data Fetching Patterns

#### 1. Paginated Customer List
```typescript
// hooks/useCustomers.ts
export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => fetchCustomers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}
```

**Server-side pagination**: Fetch 10-20 records per page (configurable), controlled via URL search params.

#### 2. Customer Health Details
```typescript
// hooks/useCustomerHealth.ts
export function useCustomerHealth(customerId: string) {
  return useQuery({
    queryKey: ['customer-health', customerId],
    queryFn: () => fetchCustomerHealth(customerId),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

#### 3. State Management Approach

**URL as Source of Truth** (for filters, pagination, search):
- Use Next.js `useSearchParams` and `useRouter`
- Filters/search/page synced to URL query params
- Enables shareable links, back button support

**Loading States**:
- **Server Components**: Suspense boundaries with `loading.tsx`
- **Client Components**: TanStack Query's `isLoading`, `isFetching` states
- Component-level skeletons (no full-page spinners)

**Error States**:
- Global `error.tsx` for unhandled errors
- Per-query error handling with `EmptyState` component
- Retry buttons for failed requests

---

## D. UX Details & Edge Cases

### Network & Performance

**Slow Network Handling:**
- Show skeleton loaders immediately (perceived performance)
- Display stale data while refetching in background
- Timeout after 30s with retry option
- Debounce search input (300ms) to reduce API calls

**Filter/Search URL Sync:**
```typescript
// Filters update URL, which triggers data refetch
const router = useRouter();
const searchParams = useSearchParams();

function updateFilters(newFilters: Filters) {
  const params = new URLSearchParams(searchParams);
  params.set('segment', newFilters.segment);
  params.set('search', newFilters.search);
  router.push(`?${params.toString()}`, { scroll: false });
}
```

**Scroll Position Preservation:**
- Use `scroll: false` in router navigation
- Leverage TanStack Query's cache to restore scroll position on back navigation
- Store scroll position in session storage as fallback

### Edge Cases

1. **No customers match filters**
   - Show `EmptyState` with "No customers found" message
   - Clear button to reset filters
   - Suggest broadening search criteria

2. **Customer detail fetch fails**
   - Show error in drawer/detail page
   - Retry button with exponential backoff
   - Fallback to cached data if available

3. **Pagination + Filter Interaction (the annoying one)**
   - User is on page 10, applies a filter that only returns 1 page of results
   - **Bad UX**: Show "No results" on page 10
   - **My approach**: Auto-reset to page 1 when filters change
   - Visual feedback: "Showing 1-10 of 45 results (filters applied)"

4. **User navigates away during data fetch**
   - TanStack Query cancels requests on unmount
   - No memory leaks from pending requests

5. **Concurrent filter updates (user types fast, changes dropdowns rapidly)**
   - Cancel in-flight requests when filters change
   - Use TanStack Query's automatic request cancellation
   - Debounce search input (300ms) to reduce API spam

---

## Design Assumptions & Open Questions

Since designs aren't finalized, here's what I'm assuming (and would clarify with the designer):

1. **Health Badge Colors**:
   - Healthy: Green (subtle, not neon)
   - Watch: Amber/Yellow
   - At Risk: Red
   - Using Tailwind's palette or design system tokens

2. **Overview Cards on Detail Page**:
   - Assuming 4 metric cards (MRR, Usage %, Last Activity, Health Score)
   - Each with subtle background colors, icons, trend indicators
   - I'd propose this layout to the designer if not already spec'd

3. **Table Sorting Indicators**:
   - Standard up/down arrows on column headers
   - Active sort column should be visually distinct

4. **Mobile Responsiveness**:
   - Drawer works great on mobile
   - Table might need horizontal scroll or card view on small screens
   - Would discuss breakpoint strategy with designer

5. **Charts & Visualizations**:
   - If usage trends need charts, I'm planning to use Recharts
   - Simple line/area charts for trends over time
   - Bar charts for event frequency if needed

**Why list these?** Better to clarify assumptions upfront than rebuild later.

---

## E. Task Breakdown

### Phase 1: Foundation & Core UI (Day 1)
- [ ] **T1.1** - Set up TanStack Query provider with base configuration
- [ ] **T1.2** - Create API utility functions and types (`lib/api/customers.ts`, `types/customer.ts`)
- [ ] **T1.3** - Build `CustomerHealthPage` shell with Suspense boundaries
- [ ] **T1.4** - Implement `CustomerHealthTable` with mock data
- [ ] **T1.5** - Build `HealthBadge` component with color variants
- [ ] **T1.6** - Create `EmptyState` component (reusable for errors/empty data)

### Phase 2: Interactivity & Data Integration (Day 1-2)
- [ ] **T2.1** - Implement `DashboardActions` (search input, filter/sort dropdowns)
- [ ] **T2.2** - Wire up `useCustomers` hook with API integration
- [ ] **T2.3** - Connect pagination controls to URL search params
- [ ] **T2.4** - Implement sorting logic (MRR, last active, health score, owner)
- [ ] **T2.5** - Add filter logic (health segment: Healthy/Watch/At Risk)
- [ ] **T2.6** - Create loading skeletons for table rows

### Phase 3: Detail Views (Day 2)
- [ ] **T3.1** - Build `CustomerDetailsDrawer` with shadcn Sheet (rounded corners, clean spacing)
- [ ] **T3.2** - Implement `useCustomerHealth` hook
- [ ] **T3.3** - Design drawer layout (recent events, usage trends, notes sections)
- [ ] **T3.4** - Add "View Full Details" button in drawer (top-right corner)
- [ ] **T3.5** - Build full detail page route (`app/customer-health/[customerId]/page.tsx`)
- [ ] **T3.6** - Create `OverviewCards` component for detail page metrics (4 cards with subtle colors)
- [ ] **T3.7** - Integrate Recharts for usage trend visualizations (line/area charts)
- [ ] **T3.8** - Build recent events table for detail page

### Phase 4: Polish & Edge Cases (Day 3)
- [ ] **T4.1** - Implement error boundaries and error states
- [ ] **T4.2** - Add retry logic for failed requests (Axios interceptors)
- [ ] **T4.3** - Test slow network scenarios (throttle to 3G in DevTools)
- [ ] **T4.4** - Verify URL sync behavior (back/forward navigation)
- [ ] **T4.5** - Add loading states for all async operations
- [ ] **T4.6** - Add Framer Motion transitions for drawer/page navigation (smooth, not snappy)
- [ ] **T4.7** - Accessibility audit (keyboard navigation, ARIA labels)
- [ ] **T4.8** - Cross-browser testing (Chrome, Firefox, Safari)

*Note: With Recharts and Framer Motion included, realistic timeline is 2-3 days (16-24 hours total).*

---

## Additional Considerations

### Design Collaboration
- Review designs with designer to align on overview card layout, chart types, and color palette
- Confirm empty state messaging and iconography
- Validate responsive breakpoints for table/drawer on mobile

### File Structure (Key Files)
```
app/
├── providers.tsx                     # TanStack Query provider setup
lib/
├── api/
│   ├── client.ts                     # Axios instance with interceptors
│   └── endpoints.ts                  # API endpoint definitions
hooks/
├── useCustomers.ts
├── useCustomerHealth.ts
components/
├── customer-health/
│   ├── customer-health-table.tsx
│   ├── customer-row.tsx
│   ├── customer-details-drawer.tsx
│   ├── dashboard-actions.tsx
│   └── health-badge.tsx
├── ui/                               # shadcn components
│   ├── sheet.tsx
│   ├── table.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── button.tsx
└── shared/
    ├── empty-state.tsx
    └── table-skeleton.tsx
```

### Testing Strategy
- Unit tests for filter/sort logic
- Integration tests for TanStack Query hooks
- E2E tests for critical flows (search → filter → view details)

---

## Summary

This implementation is designed to ship iteratively while keeping code quality high. Here's my mental model:

**Week 1, Day 1**: CSMs can see the table, sort, filter—core value delivered.  
**Week 1, Day 2**: They can open the drawer, see quick details—major UX win.  
**Week 1, Day 3**: Full detail pages are wired up, polish is done—feature complete.

The tech choices (TanStack Query, URL-based state, server components) aren't just trendy—they solve real problems:
- **TanStack Query**: Eliminates the "is this data stale?" question
- **URL state**: CSMs can share links like "show me all At Risk customers sorted by MRR"
- **Server components**: Faster initial load, better SEO if we ever need it

**One thing I'd push back on**: If the backend API doesn't support server-side pagination, we need to fix that before building this. Fetching 10k customers and paginating client-side is a non-starter.

I'm confident this can ship in 1.5-3 days, but the real timeline depends on design complexity and API stability. Happy to walk through any of this in more detail.

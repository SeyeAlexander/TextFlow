import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getDashboardData } from "@/queries/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["dashboard", null],
    queryFn: () => getDashboardData(null),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}

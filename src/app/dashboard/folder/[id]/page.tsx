import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getDashboardData } from "@/queries/dashboard";
import { FolderView } from "@/components/dashboard/folder-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderPage(props: PageProps) {
  const params = await props.params;
  const folderId = params.id;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["dashboard", folderId],
    queryFn: () => getDashboardData(folderId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FolderView folderId={folderId} />
    </HydrationBoundary>
  );
}

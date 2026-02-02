import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchDocumentById } from "@/actions/data";
import { DocumentView } from "@/components/dashboard/document-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage(props: PageProps) {
  const params = await props.params;
  const fileId = params.id;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["document", fileId],
    queryFn: () => fetchDocumentById(fileId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentView fileId={fileId} />
    </HydrationBoundary>
  );
}

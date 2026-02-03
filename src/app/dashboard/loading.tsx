import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className='my-3 mr-3 p-6 flex-1 overflow-hidden rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='max-w-2xl space-y-4'>
        <Skeleton className='h-5 w-3/4 rounded-full bg-black/5 dark:bg-white/5' />
        <Skeleton className='h-5 w-1/2 rounded-full bg-black/5 dark:bg-white/5' />
        <Skeleton className='h-5 w-1/3 rounded-full bg-black/5 dark:bg-white/5' />
        <Skeleton className='h-5 w-1/4 rounded-full bg-black/5 dark:bg-white/5' />
      </div>
    </main>
  );
}

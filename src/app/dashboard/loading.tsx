import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className='my-3 mr-3 flex-1 overflow-hidden rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <Skeleton className='h-7 w-36 rounded-lg bg-black/4 dark:bg-white/4' />
          <Skeleton className='h-4 w-72 rounded bg-black/4 dark:bg-white/4' />
        </div>

        {/* Folders Section */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-16 rounded bg-black/4 dark:bg-white/4' />
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5'>
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={`folder-${i}`}
                className='h-24 w-full rounded-xl bg-black/4 dark:bg-white/4'
              />
            ))}
          </div>
        </div>

        {/* Files Section */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-12 rounded bg-black/4 dark:bg-white/4' />
          <div className='overflow-hidden rounded-xl border border-black/5 dark:border-white/5'>
            {/* Table Header */}
            <div className='flex items-center border-b border-black/5 px-4 py-3 dark:border-white/5'>
              <Skeleton className='h-3 w-12 rounded bg-black/4 dark:bg-white/4' />
              <Skeleton className='ml-auto h-3 w-10 rounded bg-black/4 dark:bg-white/4' />
              <Skeleton className='ml-6 h-3 w-16 rounded bg-black/4 dark:bg-white/4' />
            </div>
            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`row-${i}`}
                className='flex items-center border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/5'
              >
                <div className='flex items-center gap-3'>
                  <Skeleton className='size-8 rounded-lg bg-black/4 dark:bg-white/4' />
                  <Skeleton className='h-4 w-40 rounded bg-black/4 dark:bg-white/4' />
                </div>
                <Skeleton className='ml-auto h-3 w-12 rounded bg-black/4 dark:bg-white/4' />
                <Skeleton className='ml-6 h-3 w-20 rounded bg-black/4 dark:bg-white/4' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

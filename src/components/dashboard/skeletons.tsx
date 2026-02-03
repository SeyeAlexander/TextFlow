import { Skeleton } from "@/components/ui/skeleton";

export function FileGridSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-3 pb-4 md:grid-cols-4 lg:grid-cols-6'>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className='flex flex-col items-center gap-2'>
          <Skeleton className='h-24 w-20 rounded-lg' />
          <div className='w-full space-y-1'>
            <Skeleton className='mx-auto h-3 w-16' />
            <Skeleton className='mx-auto h-2 w-10' />
          </div>
        </div>
      ))}
    </div>
  );
}

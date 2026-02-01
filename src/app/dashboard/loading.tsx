import { DotLogo } from "@/components/shared/dot-logo";

export default function DashboardLoading() {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-[#F5F5F5] dark:bg-[#111]'>
      <div className='flex flex-col items-center gap-4'>
        <DotLogo size='lg' animated={true} />
        <p className='text-sm text-neutral-500 animate-pulse'>Loading workspace...</p>
      </div>
    </div>
  );
}

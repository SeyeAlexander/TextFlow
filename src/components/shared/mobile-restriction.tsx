"use client";

import { DotLogo } from "@/components/shared/dot-logo";

export function MobileRestriction() {
  return (
    <div className='fixed inset-0 z-20 flex flex-col items-center justify-center bg-[#F5F5F5] px-6 text-center dark:bg-[#111] lg:hidden'>
      <div className='flex flex-col items-center'>
        <div className='mb-8 flex items-center justify-center gap-3'>
          <DotLogo size='lg' animated={true} />
        </div>

        <p className='max-w-[300px] border-l-2 border-orange/50 pl-4 text-left font-mono text-xs leading-relaxed text-muted-foreground'>
          Proper mobile optimizations coming soon. Our app stays sane on small laptop screens and
          above.
        </p>

        <div className='mt-12 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground'>
          <span className='h-1.5 w-1.5 rounded-full bg-orange' />
          <span>Desktop Experience</span>
        </div>
      </div>
    </div>
  );
}

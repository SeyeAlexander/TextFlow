"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DotLogo } from "@/components/shared/dot-logo";

export function MobileHero() {
  return (
    <section className='flex min-h-[90vh] flex-col justify-between px-6 py-10'>
      <header className='flex items-center justify-between'>
        <DotLogo size='sm' animated={false} color='blue' />
        <Link
          href='/login'
          className='rounded-full border border-black/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground dark:border-white/10'
        >
          Log in
        </Link>
      </header>

      <div className='space-y-5'>
        <p className='text-[11px] uppercase tracking-[0.3em] text-blue-500'>TextFlow</p>
        <h1 className='text-3xl font-semibold leading-tight'>
          A clean, collaborative editor built for focus.
        </h1>
        <p className='text-sm text-muted-foreground'>
          Real-time block editing, instant sharing, and a layout that stays out of your way.
        </p>
        <div className='flex items-center gap-3'>
          <Link
            href='/signup'
            className='inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white'
          >
            Get started
            <ArrowRight className='size-4' />
          </Link>
          <Link href='/dashboard' className='text-sm text-muted-foreground'>
            Open app
          </Link>
        </div>
      </div>

      <div className='rounded-2xl border border-black/5 bg-black/2 p-4 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5'>
        Mobile view is an abridged experience. For the full editor, use a larger screen.
      </div>
    </section>
  );
}

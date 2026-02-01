"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DotLogo } from "@/components/shared/dot-logo";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F5F5F5] px-6 dark:bg-[#111]'>
      {/* Background Grid */}
      <div className='pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating ASCII decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1, delay: 0.5 }}
        className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[20rem] font-bold leading-none text-foreground select-none'
      >
        404
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='relative z-10 flex flex-col items-center text-center'
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className='mb-8'
        >
          <DotLogo size='lg' animated={true} />
        </motion.div>

        {/* Error Code */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mb-4 font-korium text-[5rem] font-normal leading-none tracking-wider sm:text-[7rem]'
        >
          4<span className='text-orange'>0</span>4
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground'
        >
          Page not found
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='mb-10 max-w-sm text-sm text-muted-foreground'
        >
          The page you're looking for doesn't exist or has been moved to another location.
        </motion.p>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href='/'
            className='group inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-2.5 text-sm font-medium transition-all hover:border-black/20 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
          >
            <ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
            Back to home
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className='absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50'
      >
        TextFlow · Error
      </motion.div>
    </div>
  );
}

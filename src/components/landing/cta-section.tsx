"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // TODO: Handle actual submission
    }
  };

  return (
    <section className='relative overflow-hidden px-6 py-24'>
      {/* Background gradient */}
      <div className='pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent' />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='relative mx-auto max-w-3xl'
      >
        {/* Content Card */}
        <div className='rounded-3xl border border-border bg-card p-8 sm:p-12'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <span className='mb-4 inline-block font-mono text-xs uppercase tracking-wider text-primary'>
              JOIN THE WAITLIST
            </span>
            <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
              Ready to transform how your team writes?
            </h2>
            <p className='mx-auto max-w-lg text-muted-foreground'>
              Get early access to TextFlow. Be among the first to experience real-time collaboration
              without limits.
            </p>
          </div>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
              <div className='flex gap-3 rounded-xl border border-border bg-background p-2'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your work email'
                  className='flex-1 bg-transparent px-4 py-3 font-mono text-sm placeholder:text-muted-foreground focus:outline-none'
                  required
                />
                <button
                  type='submit'
                  className='group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90'
                >
                  Join
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                </button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='flex flex-col items-center justify-center gap-3 py-4'
            >
              <CheckCircle className='h-12 w-12 text-primary' />
              <p className='font-medium'>You&apos;re on the list!</p>
              <p className='text-sm text-muted-foreground'>We&apos;ll be in touch soon.</p>
            </motion.div>
          )}

          {/* Trust Signals */}
          <div className='mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8'>
            <div className='flex items-center gap-2 font-mono text-xs text-muted-foreground'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
              </span>
              SECURE CONNECTION
            </div>
            <div className='hidden h-4 w-px bg-border sm:block' />
            <div className='font-mono text-xs text-muted-foreground'>2,500+ TEAMS WAITING</div>
            <div className='hidden h-4 w-px bg-border sm:block' />
            <div className='font-mono text-xs text-muted-foreground'>NO SPAM, EVER</div>
          </div>
        </div>

        {/* Decorative barcode */}
        <div className='mt-6 flex justify-center'>
          <div className='flex h-4 gap-0.5 opacity-20'>
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className='h-full bg-foreground'
                style={{ width: i % 5 === 0 ? "3px" : "1px" }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

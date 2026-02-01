"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatItemProps {
  label: string;
  value: string;
  suffix?: string;
}

function StatItem({ label, value, suffix }: StatItemProps) {
  return (
    <div className='flex flex-col items-center gap-1 px-8 py-4'>
      <span className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>
        {label}
      </span>
      <span className='font-mono text-2xl font-bold text-foreground sm:text-3xl'>
        {value}
        {suffix && <span className='text-primary'>{suffix}</span>}
      </span>
    </div>
  );
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

export function StatsSection() {
  const stats = [
    { label: "Active Users", value: "10,000", numeric: 10000, suffix: "+" },
    { label: "Documents Created", value: "500K", numeric: 500000, suffix: "+" },
    { label: "Sync Latency", value: "<50", suffix: "ms" },
    { label: "Uptime", value: "99.9", suffix: "%" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className='relative border-y border-grid-line bg-surface-elevated px-6 py-8'
    >
      {/* Barcode decoration */}
      <div className='absolute left-6 top-1/2 hidden -translate-y-1/2 opacity-30 lg:block'>
        <div className='flex h-5 w-20 gap-0.5'>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className='h-full bg-foreground'
              style={{ width: i % 3 === 0 ? "3px" : "1px" }}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className='mx-auto flex max-w-5xl flex-wrap items-center justify-center'>
        {stats.map((stat, i) => (
          <div key={i} className='flex items-center'>
            <StatItem label={stat.label} value={stat.value} suffix={stat.suffix} />
            {i < stats.length - 1 && <div className='hidden h-12 w-px bg-border md:block' />}
          </div>
        ))}
      </div>

      {/* Barcode decoration right */}
      <div className='absolute right-6 top-1/2 hidden -translate-y-1/2 opacity-30 lg:block'>
        <div className='flex h-5 w-20 gap-0.5'>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className='h-full bg-foreground'
              style={{ width: i % 3 === 0 ? "3px" : "1px" }}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

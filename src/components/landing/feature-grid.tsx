"use client";

import { motion } from "framer-motion";
import { Blocks, Users, Zap, ArrowUpRight } from "lucide-react";
import { DotNumber } from "@/components/shared/dot-logo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

interface FeatureCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: "white" | "black" | "accent";
  specs?: { label: string; value: string }[];
}

function FeatureCard({ number, icon, title, description, variant, specs }: FeatureCardProps) {
  const variants = {
    white: {
      bg: "bg-white",
      text: "text-black",
      muted: "text-black/60",
      border: "border-black/10",
      innerBg: "bg-black/5",
      iconBg: "bg-[#ff5500]/10",
      iconColor: "text-[#ff5500]",
      arrowColor: "text-[#ff5500]",
    },
    black: {
      bg: "bg-[#0a0a0a]",
      text: "text-white",
      muted: "text-white/60",
      border: "border-white/10",
      innerBg: "bg-white/5",
      iconBg: "bg-[#ff5500]/20",
      iconColor: "text-[#ff5500]",
      arrowColor: "text-[#ff5500]",
    },
    accent: {
      bg: "bg-white",
      text: "text-black",
      muted: "text-black/60",
      border: "border-black/10",
      innerBg: "bg-black/5",
      iconBg: "bg-[#ff5500]/10",
      iconColor: "text-[#ff5500]",
      arrowColor: "text-[#ff5500]",
    },
  };

  const v = variants[variant];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative flex min-h-[580px] rounded-xs flex-col border ${v.border} ${v.bg}`}
    >
      {/* Header with number and arrow */}
      <div className='flex items-start justify-between p-6'>
        <DotNumber number={number} color='orange' />
        <div className={v.arrowColor}>
          <ArrowUpRight className='h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1' />
        </div>
      </div>

      {/* Main content */}
      <div className='flex flex-1 flex-col p-6'>
        {/* Icon */}
        <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-sm ${v.iconBg}`}>
          <div className={v.iconColor}>{icon}</div>
        </div>

        {/* Title & Description */}
        <h3 className={`font-korium mb-3 text-xl font-medium ${v.text}`}>{title}</h3>
        <p className={`flex-1 text-sm leading-relaxed ${v.muted}`}>{description}</p>

        {/* Specs Grid */}
        {specs && (
          <div className='mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-inherit'>
            {specs.map((spec, i) => (
              <div key={i} className={`px-4 py-12 ${v.innerBg}`}>
                <span className={`block font-mono text-[10px] uppercase tracking-wider ${v.muted}`}>
                  {spec.label}
                </span>
                <span className={`mt-1 block font-mono text-sm font-medium ${v.text}`}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function FeatureGrid() {
  const features: FeatureCardProps[] = [
    {
      number: "01",
      icon: <Blocks className='h-6 w-6' />,
      title: "Block-Based Editor",
      description:
        "Build documents with modular blocks. Drag, drop, and nest content with infinite flexibility. Every block is customizable and extensible.",
      variant: "white",
      specs: [
        { label: "BLOCK TYPES", value: "20+" },
        { label: "NESTING", value: "∞" },
      ],
    },
    {
      number: "02",
      icon: <Users className='h-6 w-6' />,
      title: "Real-Time Collaboration",
      description:
        "See your team's cursors, selections, and changes as they happen. Conflict-free editing powered by CRDTs. Up to 3 simultaneous collaborators.",
      variant: "black",
      specs: [
        { label: "LATENCY", value: "< 50ms" },
        { label: "COLLABORATORS", value: "3" },
      ],
    },
    {
      number: "03",
      icon: <Zap className='h-6 w-6' />,
      title: "Lightning Performance",
      description:
        "Optimized for speed at every layer. Instant saves, instant sync, instant everything. Your documents load in milliseconds, not seconds.",
      variant: "accent",
      specs: [
        { label: "SYNC", value: "< 50ms" },
        { label: "UPTIME", value: "99.9%" },
      ],
    },
  ];

  return (
    <section id='features' className='relative border-0 border-[rgba(255,255,255,0.15)] px-6 py-24'>
      {/* Section Header */}
      <div className='mx-auto mb-16 max-w-2xl text-center'>
        <span className='mb-4 inline-block font-mono text-sm text-orange'>CAPABILITIES</span>
        <h2 className='font-korium mb-4 text-3xl font-medium tracking-tight sm:text-4xl'>
          Everything you need to write together
        </h2>
        <p className='text-muted-foreground'>
          A complete toolkit for modern documentation. Built for teams who value speed, simplicity,
          and seamless collaboration.
        </p>
      </div>

      {/* Feature Grid - 3 cards with gaps */}
      <motion.div
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: "-100px" }}
        className='mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3'
      >
        {features.map((feature) => (
          <FeatureCard key={feature.number} {...feature} />
        ))}
      </motion.div>
    </section>
  );
}

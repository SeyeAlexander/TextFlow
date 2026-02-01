"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Navigation() {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/docs", label: "Docs" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className='fixed top-0 left-0 right-0 z-50 px-6 py-4'
    >
      <nav className='mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border/50 bg-background/80 px-6 py-3 backdrop-blur-md'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2'>
          <span className='font-mono text-lg font-bold tracking-tight'>TEXTFLOW</span>
          <span className='hidden rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary sm:inline-block'>
            BETA
          </span>
        </Link>

        {/* Nav Links */}
        <div className='hidden items-center gap-1 md:flex'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <Link
            href='/login'
            className='rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            Sign in
          </Link>
          <Link
            href='/signup'
            className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
          >
            Get Started
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

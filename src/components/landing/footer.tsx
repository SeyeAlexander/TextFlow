"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  const footerLinks = {
    product: [
      { href: "#features", label: "Features" },
      { href: "#pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
      { href: "/docs", label: "Documentation" },
    ],
    company: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className='border-t border-border bg-background dark:bg-[#1a1a1a] px-6 py-12'
    >
      <div className='mx-auto max-w-6xl'>
        {/* Main Footer */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-5'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <Link href='/' className='inline-block'>
              <span className='font-mono text-lg font-bold tracking-tight'>TEXTFLOW</span>
            </Link>
            <p className='mt-3 max-w-xs text-sm text-muted-foreground'>
              Real-time collaborative editing for teams who move fast.
            </p>
            <div className='mt-4 flex gap-3'>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                <Twitter className='h-4 w-4' />
              </a>
              <a
                href='https://github.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                <Github className='h-4 w-4' />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className='mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground'>
              Product
            </h4>
            <ul className='space-y-2'>
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className='mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground'>
              Company
            </h4>
            <ul className='space-y-2'>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className='mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground'>
              Legal
            </h4>
            <ul className='space-y-2'>
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row'>
          <p className='text-sm text-muted-foreground'>© 2026 TextFlow. All rights reserved.</p>
          <div className='flex items-center gap-4 font-mono text-xs text-muted-foreground'>
            <span className='flex items-center gap-2'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
              </span>
              ALL SYSTEMS OPERATIONAL
            </span>
            <span className='hidden sm:inline'>|</span>
            <span className='hidden sm:inline'>SYS_ID: #TF25A1</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

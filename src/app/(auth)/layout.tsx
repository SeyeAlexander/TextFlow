"use client";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DotLogo } from "@/components/shared/dot-logo";
import { useEffect, useRef } from "react";
import Link from "next/link";

// Animated Dot Globe - a sphere made of dots that rotates
function DotGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate sphere points
    const points: { x: number; y: number; z: number; baseOpacity: number }[] = [];
    const numPoints = 800;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    // Fibonacci sphere distribution for even spacing
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < numPoints; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);

      points.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        baseOpacity: 0.3 + Math.random() * 0.7,
      });
    }

    let rotation = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dynamicRadius = Math.min(canvas.width, canvas.height) * 0.35;

      // Sort points by z for depth
      const rotatedPoints = points.map((p) => {
        // Rotate around Y axis
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const x = p.x * cosR - p.z * sinR;
        const z = p.x * sinR + p.z * cosR;

        // Slight tilt on X axis
        const tilt = 0.2;
        const cosT = Math.cos(tilt);
        const sinT = Math.sin(tilt);
        const y = p.y * cosT - z * sinT;
        const finalZ = p.y * sinT + z * cosT;

        return { x, y, z: finalZ, baseOpacity: p.baseOpacity };
      });

      rotatedPoints.sort((a, b) => a.z - b.z);

      // Draw points
      rotatedPoints.forEach((p) => {
        const screenX = centerX + p.x * dynamicRadius;
        const screenY = centerY + p.y * dynamicRadius;

        // Depth-based sizing and opacity
        const depth = (p.z + 1) / 2; // 0 to 1
        const size = 1 + depth * 2;
        const opacity = p.baseOpacity * (0.15 + depth * 0.85);

        // Orange tint for front-facing dots
        const orangeAmount = Math.max(0, depth - 0.5) * 2;
        const r = Math.round(255 * orangeAmount + 255 * (1 - orangeAmount));
        const g = Math.round(100 * orangeAmount + 255 * (1 - orangeAmount));
        const b = Math.round(50 * orangeAmount + 255 * (1 - orangeAmount));

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();

        // Glow for bright front dots
        if (depth > 0.7 && p.baseOpacity > 0.8) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            size * 3,
          );
          gradient.addColorStop(0, `rgba(216, 67, 21, ${opacity * 0.3})`);
          gradient.addColorStop(1, "rgba(216, 67, 21, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      rotation += 0.003;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className='relative h-full w-full overflow-hidden rounded-3xl bg-black'>
      {/* Canvas for dot globe */}
      <canvas ref={canvasRef} className='absolute inset-0 h-full w-full' />

      {/* Subtle vignette */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Branding */}
      <div className='absolute bottom-8 left-8 font-mono text-[10px] uppercase tracking-widest text-white/30'>
        TextFlow v1.0
      </div>
      <div className='absolute right-8 top-8 font-mono text-[10px] uppercase tracking-widest text-white/30'>
        Global Collaboration
      </div>

      {/* Corner accents */}
      <div className='absolute left-8 top-8 h-12 w-px bg-linear-to-b from-deep-orange/50 to-transparent' />
      <div className='absolute left-8 top-8 h-px w-12 bg-linear-to-r from-deep-orange/50 to-transparent' />
      <div className='absolute bottom-8 right-8 h-12 w-px bg-linear-to-t from-deep-orange/50 to-transparent' />
      <div className='absolute bottom-8 right-8 h-px w-12 bg-linear-to-l from-deep-orange/50 to-transparent' />
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen dark:bg-[#111]'>
      {/* Left side - Auth form */}
      <div className='flex w-full flex-col items-center justify-center bg-background px-8 dark:bg-[#111] lg:w-1/2'>
        <div className='w-full max-w-sm'>
          {/* Logo - navigates to home */}
          <div className='mb-8'>
            <Link href='/'>
              <DotLogo size='md' animated />
            </Link>
          </div>

          {/* Form content from children */}
          {children}

          {/* Theme toggle */}
          <div className='mt-8 flex justify-center'>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Right side - Dot Globe */}
      <div className='hidden w-1/2 p-4 lg:flex'>
        <DotGlobe />
      </div>
    </div>
  );
}

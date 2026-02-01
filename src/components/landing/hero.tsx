"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DotLogo } from "@/components/shared/dot-logo";

// Dynamically import Three.js only on client side
let THREE: typeof import("three") | null = null;

export function Hero() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: "0.00", y: "0.00", z: "14.2" });
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  // Load Three.js dynamically
  useEffect(() => {
    import("three").then((module) => {
      THREE = module;
      setIsThreeLoaded(true);
    });
  }, []);

  // WebGL Particle Flow scene
  useEffect(() => {
    if (!isThreeLoaded || !THREE || !canvasRef.current) return;

    const container = canvasRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create flowing particle mesh
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Create connecting lines between nearby particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    });

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) / windowHalfX;
      mouseY = (event.clientY - windowHalfY) / windowHalfY;

      setCoords({
        x: mouseX.toFixed(2),
        y: (-mouseY).toFixed(2),
        z: "30.0",
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    function animate() {
      requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array as Float32Array;

      // Animate particles with wave motion
      const time = Date.now() * 0.001;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Add wave motion
        positions[i3] += velocities[i].x + Math.sin(time + i * 0.01) * 0.01;
        positions[i3 + 1] += velocities[i].y + Math.cos(time + i * 0.01) * 0.01;
        positions[i3 + 2] += velocities[i].z;

        // Wrap around boundaries
        if (positions[i3] > 30) positions[i3] = -30;
        if (positions[i3] < -30) positions[i3] = 30;
        if (positions[i3 + 1] > 30) positions[i3 + 1] = -30;
        if (positions[i3 + 1] < -30) positions[i3 + 1] = 30;
        if (positions[i3 + 2] > 15) positions[i3 + 2] = -15;
        if (positions[i3 + 2] < -15) positions[i3 + 2] = 15;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Rotate based on mouse
      particles.rotation.y += 0.001;
      particles.rotation.y += mouseX * 0.001;
      particles.rotation.x += mouseY * 0.0005;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [isThreeLoaded]);

  const specs = [
    { label: "Sync Latency", value: "< 50ms" },
    { label: "Uptime", value: "99.9%" },
    { label: "Format", value: "Block / MD / JSON" },
  ];

  const features = [
    {
      num: "01",
      title: "Real-Time Collaboration",
      desc: "See your team's cursors and changes as they happen. Conflict-free editing powered by CRDTs.",
    },
    {
      num: "02",
      title: "Block-Based Editor",
      desc: "Build documents with modular, nestable blocks. Drag, drop, and structure content intuitively.",
    },
  ];

  return (
    <section className='min-h-screen'>
      {/* Main Grid - FORMA ENGINE Layout */}
      <div className='grid min-h-screen grid-cols-1 border-0 border-[rgba(255,255,255,0.15)] lg:grid-cols-[60%_40%]'>
        {/* Left Column */}
        <div className='relative flex flex-col border-r border-[rgba(255,255,255,0.15)]'>
          {/* Crosshairs */}
          <div className='pointer-events-none absolute -bottom-2 -right-2 z-10 h-4 w-4'>
            <div className='absolute left-1/2 h-full w-px -translate-x-1/2 bg-black dark:bg-white' />
            <div className='absolute top-1/2 h-px w-full -translate-y-1/2 bg-black dark:bg-white' />
          </div>

          {/* HUD Header */}
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='grid h-[60px] grid-cols-4 border-b dark:border-[rgba(255,255,255,0.15)] font-mono text-[10px] uppercase tracking-widest'
          >
            <div className='flex items-center justify-between border-r dark:border-[rgba(255,255,255,0.15)] px-4 text-muted-foreground lg:px-6'>
              <DotLogo size='sm' animated={false} />
              <span className='relative flex h-1.5 w-1.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-75' />
                <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-orange' />
              </span>
            </div>
            <div className='flex items-center border-r dark:border-[rgba(255,255,255,0.15)] px-4 text-muted-foreground lg:px-6'>
              <span>V. 1.0.0</span>
            </div>
            <div className='flex items-center justify-center border-r dark:border-[rgba(255,255,255,0.15)] px-4 lg:px-6'>
              <Link href='/signup' className='text-orange transition-colors hover:text-deep-orange'>
                GET STARTED →
              </Link>
            </div>
            <div className='flex items-center justify-center px-4 lg:px-6'>
              <ThemeToggle />
            </div>
          </motion.header>

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='flex flex-1 flex-col justify-center px-[4vw] py-[8vh]'
          >
            <h1 className='mb-10 font-korium text-[clamp(4rem,10vw,10rem)] font-normal  leading-[0.85] tracking-wider'>
              Text
              {/* <br /> */}
              <span className='text-orange'>Flow</span>
            </h1>
            <p className='max-w-[400px] border-l-2 border-orange/50 pl-5 font-mono text-sm leading-relaxed text-muted-foreground'>
              Real-time collaborative block-based editor. Build documents together with zero latency
              and infinite flexibility.
            </p>
          </motion.section>

          {/* Specs Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='grid grid-cols-3 border-t dark:border-[rgba(255,255,255,0.15)]'
          >
            {specs.map((spec, i) => (
              <div
                key={i}
                className={`p-6 font-mono ${
                  i < specs.length - 1 ? "border-r dark:border-[rgba(255,255,255,0.15)]" : ""
                }`}
              >
                <span className='mb-2 block text-[10px] uppercase text-muted-foreground'>
                  {spec.label}
                </span>
                <span className='text-base text-foreground'>{spec.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Feature Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className='border-t dark:border-[rgba(255,255,255,0.15)]'
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className='grid min-h-[120px] grid-cols-[60px_1fr] border-0 dark:border-[rgba(255,255,255,0.15)]'
              >
                <div className='flex items-center justify-center border-0 dark:border-[rgba(255,255,255,0.15)] font-mono text-xs text-orange'>
                  {feature.num}
                </div>
                <div className='flex flex-col justify-center p-6'>
                  <div className='mb-2 font-korium text-lg font-medium'>{feature.title}</div>
                  <div className='max-w-[300px] font-mono text-xs text-muted-foreground'>
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='grid grid-cols-2'
          >
            <Link
              href='/login'
              className='group flex items-center justify-between border-t dark:border-[rgba(255,255,255,0.15)] text-deep-orange p-2 transition-all duration-200 hover:opacity-90 lg:p-2 lg:px-5'
            >
              <span className='text-xl tracking-tight lg:text-2xl'>Sign In</span>
              <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
            </Link>
            <Link
              href='/signup'
              className='group flex items-center justify-between border-t dark:border-[rgba(255,255,255,0.15)] text-orange p-2 transition-all duration-200 hover:opacity-90 lg:p-2 lg:px-5'
            >
              <span className='text-xl tracking-tight lg:text-2xl'>Sign Up</span>
              <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
            </Link>
          </motion.div>
        </div>

        {/* Right Column - 3D Visualization */}
        <div className='relative hidden overflow-hidden bg-[radial-gradient(circle_at_center,#111_0%,#000_100%)] lg:block'>
          {/* Scan Lines Overlay */}
          <div
            className='pointer-events-none absolute inset-0 z-1'
            style={{
              background: `repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.03),
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent 4px
              )`,
            }}
          />

          {/* Canvas Container */}
          <div ref={canvasRef} className='absolute inset-0 z-1' />

          {/* Overlay UI */}
          <div className='pointer-events-none absolute inset-0 z-2 flex flex-col justify-between p-8'>
            <div className='self-start bg-orange px-2 py-1 font-mono text-[10px] font-bold text-black'>
              SYNC: LIVE
            </div>
            <div className='self-end text-right font-mono text-[10px] text-muted-foreground'>
              X: <span>{coords.x}</span>
              <br />
              Y: <span>{coords.y}</span>
              <br />
              Z: <span>{coords.z}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

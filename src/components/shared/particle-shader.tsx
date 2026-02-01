"use client";

import { useEffect, useRef, useState } from "react";

// Dynamically import Three.js only on client side
let THREE: typeof import("three") | null = null;

export function ParticleShader({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);
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
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) / windowHalfX;
      mouseY = (event.clientY - windowHalfY) / windowHalfY;
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

      const posArray = particles.geometry.attributes.position.array as Float32Array;

      // Animate particles with wave motion
      const time = Date.now() * 0.0008;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Add wave motion
        posArray[i3] += velocities[i].x + Math.sin(time + i * 0.008) * 0.008;
        posArray[i3 + 1] += velocities[i].y + Math.cos(time + i * 0.008) * 0.008;
        posArray[i3 + 2] += velocities[i].z;

        // Wrap around boundaries
        if (posArray[i3] > 25) posArray[i3] = -25;
        if (posArray[i3] < -25) posArray[i3] = 25;
        if (posArray[i3 + 1] > 25) posArray[i3 + 1] = -25;
        if (posArray[i3 + 1] < -25) posArray[i3 + 1] = 25;
        if (posArray[i3 + 2] > 12) posArray[i3 + 2] = -12;
        if (posArray[i3 + 2] < -12) posArray[i3 + 2] = 12;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Rotate based on mouse
      particles.rotation.y += 0.0008;
      particles.rotation.y += mouseX * 0.0008;
      particles.rotation.x += mouseY * 0.0004;

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
      renderer.dispose();
    };
  }, [isThreeLoaded]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Scan Lines Overlay */}
      <div
        className='pointer-events-none absolute inset-0 z-10'
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.02),
            rgba(255,255,255,0.02) 1px,
            transparent 1px,
            transparent 3px
          )`,
        }}
      />

      {/* Canvas Container */}
      <div ref={canvasRef} className='absolute inset-0' />

      {/* Subtle gradient overlay */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}

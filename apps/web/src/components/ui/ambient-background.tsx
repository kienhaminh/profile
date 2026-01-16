'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * AmbientBackground - Creates a premium ambient background with GSAP-animated effects.
 *
 * Features:
 * - GSAP-animated floating orbs (Aurora/Mesh style)
 * - Subtle parallax scroll effect for depth
 * - Grid pattern overlay with gradient fade
 * - Subtle noise texture for depth
 * - Respects reduced motion preferences
 */
export const AmbientBackground: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const orbLayer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      // 1. Floating Animation (Ambient movement)
      const orbs = gsap.utils.toArray<HTMLElement>('.ambient-orb');

      orbs.forEach((orb, i) => {
        // Random starting positions
        gsap.set(orb, {
          x: gsap.utils.random(-20, 20, true),
          y: gsap.utils.random(-20, 20, true),
          rotation: gsap.utils.random(0, 360, true),
          scale: gsap.utils.random(0.8, 1.2, true),
        });

        // Ambient drift
        gsap.to(orb, {
          x: '+=40',
          y: '+=30',
          rotation: '+=30',
          scale: 1.1,
          duration: gsap.utils.random(15, 25),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });
      });

      // 2. Parallax Scroll Effect
      // Create a slow vertical move based on scroll position
      gsap.to(orbLayer.current, {
        y: (index, target) => -150, // Move up slightly as we scroll down
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5, // High scrub value for "soft/liquid" feel
        },
      });

      // Parallax for grid (even slower)
      gsap.to('.bg-grid', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });
    },
    { scope: container }
  );

  return (
    <div
      ref={container}
      className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-background"
    >
      {/* Parallax Orb Layer */}
      <div
        ref={orbLayer}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-20 dark:opacity-30 overflow-hidden">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
        </div>
      </div>

      {/* Grid pattern - moving even slower for parallax depth */}
      <div
        className="absolute inset-0 bg-grid opacity-[0.4] dark:opacity-[0.2] will-change-transform"
        aria-hidden="true"
      />

      {/* Noise texture - remains fixed to screen for tactile feel */}
      <div
        className="absolute inset-0 bg-noise opacity-[0.015] pointer-events-none"
        aria-hidden="true"
      />

      {/* Vignette effect for depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_85%)] opacity-40"
        aria-hidden="true"
      />
    </div>
  );
};

export default AmbientBackground;

'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageClientProps {
  children: React.ReactNode;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({ children }) => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      // Hero Avatar Animation
      tl.from('.hero-avatar', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'back.out(1.7)',
      });

      // Heading Animation (Split effect)
      tl.from(
        '.hero-heading',
        {
          y: 40,
          opacity: 0,
          stagger: 0.1,
        },
        '-=0.8'
      );

      // Bio Animation
      tl.from(
        '.hero-bio',
        {
          y: 20,
          opacity: 0,
        },
        '-=0.6'
      );

      // CTAs Animation
      tl.from(
        '.hero-cta',
        {
          y: 10,
          opacity: 0,
          stagger: 0.1,
        },
        '-=0.4'
      );

      // Scroll Animations for sections
      const sections = ['#work', '#stack', '#blog', '#about'];
      sections.forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
        });
      });

      // Floating effect for avatar
      gsap.to('.hero-avatar', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      // Optimized mouse interactions
      const cursor = document.createElement('div');
      cursor.className = 'cursor-follower';
      document.body.appendChild(cursor);

      // Use quickSetter for better performance on high-frequency updates
      const xSet = gsap.quickSetter(cursor, 'x', 'px');
      const ySet = gsap.quickSetter(cursor, 'y', 'px');

      // Parallax setters
      const avatarXSet = gsap.quickSetter('.hero-avatar', 'x', 'px');
      const avatarYSet = gsap.quickSetter('.hero-avatar', 'y', 'px');
      const headingXSet = gsap.quickSetter('.hero-heading', 'x', 'px');
      const headingYSet = gsap.quickSetter('.hero-heading', 'y', 'px');

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;

        // Update cursor
        xSet(clientX);
        ySet(clientY);

        // Update parallax (subtle delayed movement)
        const moveX = (clientX - window.innerWidth / 2) / 60;
        const moveY = (clientY - window.innerHeight / 2) / 60;

        avatarXSet(moveX);
        avatarYSet(moveY);
        headingXSet(moveX * 0.5);
        headingYSet(moveY * 0.5);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (document.body.contains(cursor)) {
          document.body.removeChild(cursor);
        }
      };
    },
    { scope: container }
  );

  return <div ref={container}>{children}</div>;
};

export default HomePageClient;

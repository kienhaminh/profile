'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HomeAnimations(): null {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Set initial states
    gsap.set('.hero-avatar', { scale: 0, opacity: 0 });
    gsap.set('.hero-title', { y: 50, opacity: 0 });
    gsap.set('.hero-subtitle', { y: 30, opacity: 0 });
    gsap.set('.hero-description', { y: 30, opacity: 0 });
    gsap.set('.hero-social', { scale: 0, opacity: 0 });
    gsap.set('.hero-cta', { y: 30, opacity: 0 });

    // Hero section animations
    const tl = gsap.timeline({ delay: 0.3 });

    tl.to('.hero-avatar', {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'back.out(1.7)',
    })
      .to(
        '.hero-title',
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.4'
      )
      .to(
        '.hero-subtitle',
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      )
      .to(
        '.hero-description',
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      )
      .to(
        '.hero-social',
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        },
        '-=0.4'
      )
      .to(
        '.hero-cta',
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
        },
        '-=0.3'
      );

    // Floating animation for avatar
    gsap.to('.hero-avatar', {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Floating animation for background blobs
    gsap.to('.bg-blob-1', {
      x: 30,
      y: -30,
      scale: 1.1,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to('.bg-blob-2', {
      x: -30,
      y: 30,
      scale: 1.1,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1,
    });

    // Section title animations
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title) => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });

    // Project cards animation
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
        y: 100,
        opacity: 0,
        rotation: index % 2 === 0 ? -5 : 5,
        duration: 1,
        ease: 'power3.out',
        delay: index * 0.2,
      });

      // Hover animation
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });

    // Blog cards animation
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: index * 0.15,
      });
    });

    // Footer animation
    const footerSections = document.querySelectorAll('.footer-section');
    gsap.from(footerSections, {
      scrollTrigger: {
        trigger: '.footer-section',
        start: 'top 90%',
        end: 'top 60%',
        toggleActions: 'play none none reverse',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
    });

    // Parallax effect for sections
    const parallaxSections = document.querySelectorAll('.parallax-section');
    parallaxSections.forEach((section) => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
      });
    });

    // Button hover animations
    const buttons = document.querySelectorAll('.animated-button');
    buttons.forEach((button) => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });

    // Scroll indicator animation
    gsap.to('.scroll-indicator', {
      y: 10,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}

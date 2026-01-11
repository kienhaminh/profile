'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

import { Github, Linkedin, ExternalLink } from 'lucide-react';
import { INFORMATION } from '@/constants/information';

import Image from 'next/image';
import avatarImage from '@/assets/avatar.jpg';

interface NavLinkConfig {
  href: string;
  label: string;
  scrollTo?: string;
}

function getNavLinks(): NavLinkConfig[] {
  return [
    {
      href: '/#work',
      label: 'Work',
      scrollTo: 'work',
    },
    {
      href: '/#stack',
      label: 'Stack',
      scrollTo: 'stack',
    },
    {
      href: '/blog',
      label: 'Writing',
      scrollTo: 'blog',
    },
    {
      href: '/utilities',
      label: 'Utilities',
    },
    {
      href: '/#about',
      label: 'About',
      scrollTo: 'about',
    },
  ];
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    const navHeight = 64;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

export function Navbar(): JSX.Element {
  const pathname = usePathname() ?? '/';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = getNavLinks();
  const isHomePage = pathname === '/';

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavLinkConfig
  ) => {
    if (isHomePage && link.scrollTo) {
      e.preventDefault();
      scrollToSection(link.scrollTo);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5"
      aria-label="Main navigation"
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Home"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-700 grayscale hover:grayscale-0 hover:scale-110 transition-all duration-300">
            <Image
              src={avatarImage}
              alt="Avatar"
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        </Link>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {links.map((link) => {
            const isActive =
              (link.href === '/blog' && pathname.startsWith('/blog')) ||
              (link.href === '/utilities' && pathname.startsWith('/utilities'));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`transition-colors hover:text-foreground ${isActive ? 'text-foreground' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Social + Contact */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-2 border-r border-border/50 pr-4">
            <a
              href={INFORMATION.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github
                className="w-5 h-5 focus-visible:ring-2 focus-visible:ring-ring"
                strokeWidth={1.5}
              />
            </a>
            <a
              href={INFORMATION.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin
                className="w-5 h-5 focus-visible:ring-2 focus-visible:ring-ring"
                strokeWidth={1.5}
              />
            </a>
            <ThemeToggle />
          </div>

          <Link
            href={`mailto:${INFORMATION.email}`}
            className={buttonVariants({
              size: 'sm',
              className:
                'hidden md:inline-flex bg-foreground text-background rounded-full px-4 py-1.5 text-xs font-medium hover:bg-foreground/90 transition-colors',
            })}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavLinkConfig {
  href: string;
  label: string;
  scrollTo?: string; // ID to scroll to on home page
}

function getNavLinks(): NavLinkConfig[] {
  return [
    {
      href: '/blog',
      label: 'Blog',
      scrollTo: 'blog',
    },
    {
      href: '/projects',
      label: 'Projects',
      scrollTo: 'projects',
    },
    {
      href: '/utilities',
      label: 'Utilities',
    },
    {
      href: '/#about',
      label: 'About Me',
      scrollTo: 'about',
    },
  ];
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    const navHeight = 64; // navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

function getLinkClasses(isActive: boolean): string {
  if (isActive) {
    return 'px-4 py-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors';
  }
  return 'px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors';
}

export function Navbar(): JSX.Element {
  const pathname = usePathname() ?? '/';
  const { resolvedTheme } = useTheme();
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

  const handleContactClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isHomePage) {
      e.preventDefault();
      scrollToSection('contact');
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/30 shadow-lg dark:shadow-primary/10"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo on the left */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              aria-label="Home"
            >
              <div className="w-[72px] h-10 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105">
                {mounted ? (
                  <Image
                    src={resolvedTheme === 'dark' ? logoDark : logoLight}
                    alt="Kien Ha Logo"
                    width={72}
                    height={40}
                    className="w-full h-full object-contain"
                    priority
                  />
                ) : (
                  <div className="w-[72px] h-10 bg-primary/10 animate-pulse" />
                )}
              </div>
            </Link>
          </div>

          {/* Menu in the center */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const isActive =
                (link.href === '/blog' && pathname.startsWith('/blog')) ||
                (link.href === '/projects' &&
                  pathname.startsWith('/projects')) ||
                (link.href === '/#about' && pathname === '/' && false); // about is always not active in navbar

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={getLinkClasses(isActive)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Theme toggle and Contact Me button on the right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isHomePage ? (
              <Button
                onClick={handleContactClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
              >
                Contact Me
              </Button>
            ) : (
              <Link href="/#contact">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200">
                  Contact Me
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden px-4 pb-3 space-y-1">
        {links.map((link) => {
          const isActive =
            (link.href === '/blog' && pathname.startsWith('/blog')) ||
            (link.href === '/projects' && pathname.startsWith('/projects'));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className={`block ${getLinkClasses(isActive)}`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="pt-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

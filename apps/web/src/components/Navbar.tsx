'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/constants/information';
import { Mail } from 'lucide-react';

interface NavLinkConfig {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

function getNavLinks(): NavLinkConfig[] {
  return [
    {
      href: '/projects',
      label: 'Projects',
      match: (pathname: string) => pathname.startsWith('/projects'),
    },
    {
      href: '/blog',
      label: 'Blog',
      match: (pathname: string) => pathname.startsWith('/blog'),
    },
  ];
}

function getLinkClasses(isActive: boolean): string {
  if (isActive) {
    return 'px-3 py-2 text-sm sm:text-base text-purple-600 bg-purple-50 rounded-lg font-medium transition-all duration-200';
  }
  return 'px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
}

export function Navbar(): JSX.Element {
  const pathname = usePathname() ?? '/';
  const links = getNavLinks();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-sm"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
              aria-label="Home"
            >
              {process.env.NEXT_PUBLIC_SITE_NAME || 'Kien Ha'}
            </Link>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {links.map((link) => {
              const isActive = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getLinkClasses(isActive)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href={`mailto:${CONTACT.email}`}>
              <Button
                size="sm"
                className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Mail className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Contact</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

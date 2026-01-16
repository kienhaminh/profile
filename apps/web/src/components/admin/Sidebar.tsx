'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Hash,
  FolderTree,
  LogOut,
  Menu,
  Wrench,
  Brain,
  BookOpen,
  Layers,
  Link2,
  BarChart3,
  DollarSign,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authPost } from '@/lib/auth';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  items?: {
    name: string;
    href: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Post',
    href: '/admin/blogs',
    icon: FileText,
  },
  {
    name: 'Favorites',
    href: '/admin/favorites',
    icon: Heart,
  },
  {
    name: 'Shortlinks',
    href: '/admin/shortlinks',
    icon: Link2,
  },
  /*
  {
    name: 'Projects',
    href: '/admin/projects',
    icon: Layers,
  },
*/
  {
    name: 'Finance',
    href: '/admin/finance',
    icon: DollarSign,
    items: [
      {
        name: 'Overview',
        href: '/admin/finance/overview',
      },
      {
        name: 'Records',
        href: '/admin/finance/detail',
      },
    ],
  },
  {
    name: 'Tools',
    href: '/admin/tools',
    icon: Wrench,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setError(null);
      const response = await authPost('/api/admin/logout', {});

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Logout failed');
      }

      // Only redirect on successful logout
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during logout'
      );
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm ring-2 ring-background">
          A
        </div>
        <span className="text-foreground font-medium text-sm tracking-tight">
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.items?.some((subItem) => pathname === subItem.href) ??
                false);
            const isSubItemActive = (href: string) => pathname === href;

            if (item.items) {
              return (
                <li key={item.href}>
                  <Collapsible
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={`flex items-center justify-between w-full gap-3 px-3 py-2 text-sm rounded-md transition-all ${
                          isActive
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-1 space-y-1 pl-10">
                        {item.items.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block px-3 py-2 text-sm rounded-md transition-all ${
                                isSubItemActive(subItem.href)
                                  ? 'text-foreground bg-accent border border-border'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all ${
                    isActive
                      ? 'text-foreground bg-accent border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 py-6 mt-auto border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Theme
          </span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all w-full group"
        >
          <LogOut
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            strokeWidth={1.5}
          />
          <span>Sign Out</span>
        </button>
        {error && (
          <p className="text-xs text-destructive mt-2 bg-destructive/10 p-2 rounded border border-destructive/20">
            {error}
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button and Sheet */}
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 transition-transform duration-200 hover:scale-105 shadow-md"
            >
              <Menu className="h-4 w-4 transition-transform duration-200" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-card border-border">
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Main navigation menu for the admin dashboard
              </SheetDescription>
            </VisuallyHidden>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

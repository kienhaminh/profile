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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { authPost } from '@/lib/auth';

const menuItems = [
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
    name: 'Hashtag',
    href: '/admin/hashtags',
    icon: Hash,
  },
  {
    name: 'Topic',
    href: '/admin/topics',
    icon: FolderTree,
  },
  {
    name: 'Knowledge',
    href: '/admin/knowledge',
    icon: Brain,
  },
  {
    name: 'Vocabulary',
    href: '/admin/vocabulary',
    icon: Brain,
  },
  {
    name: 'Folktales',
    href: '/admin/history',
    icon: BookOpen,
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
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg dark:shadow-primary/30">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Content Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg dark:shadow-primary/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"></div>
                  )}
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? 'scale-110'
                        : 'group-hover:scale-110 group-hover:text-primary'
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-200 rounded-xl"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full flex items-center gap-3 justify-start text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-medium">Sign Out</span>
        </Button>
        {error && (
          <p className="text-sm text-destructive mt-2 bg-destructive/10 p-2 rounded-lg border border-destructive/30">
            {error}
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full bg-card border-r border-border w-64">
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
          <SheetContent side="left" className="w-64 p-0 bg-card">
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

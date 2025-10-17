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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DialogTitle, VisuallyHidden } from '@/components/ui/dialog';
import { authPost } from '@/lib/auth-client';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
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
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setError(null);
      const response = await authPost('/api/admin/logout');

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
      <VisuallyHidden>
        <DialogTitle>Admin Panel Navigation</DialogTitle>
      </VisuallyHidden>
      <div className="p-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full flex items-center gap-3 justify-start text-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full bg-gray-900 text-white w-64">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button and Sheet */}
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-gray-900 text-white">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

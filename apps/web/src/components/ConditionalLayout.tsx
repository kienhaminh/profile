'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, render only children (no navbar/footer)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For public routes, render with navbar and footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

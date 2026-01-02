import { Sidebar } from '@/components/admin/Sidebar';
import { getServerAuth } from '@/lib/server-auth';
import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAuthenticated: boolean;
  let user: { id: string; role: string } | null;

  try {
    const authResult = await getServerAuth();
    ({ isAuthenticated, user } = authResult);
  } catch (error) {
    logger.error('Authentication check failed in admin layout', { error });
    redirect('/admin/login');
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  if (user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">{children}</div>
      </main>
    </div>
  );
}

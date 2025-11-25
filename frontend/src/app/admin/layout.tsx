'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebarLayout } from '@/components/layout/admin-sidebar-layout';
import { useAuth } from '@/contexts/AuthContext';
import { hasAdminAccess } from '@/lib/rbac-utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    } else if (!loading && isAuthenticated && !hasAdminAccess(user)) {
      // Redirect users without admin access to request-access page
      router.push('/request-access');
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing (will redirect) if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // return <AdminSidebarLayout>{children}</AdminSidebarLayout>;
  return <AdminSidebarLayout>{children}</AdminSidebarLayout>;
}


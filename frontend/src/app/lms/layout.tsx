'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LMSNavigation } from '@/components/lms/LMSNavigation';

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current route is admin route
  const isAdminRoute = pathname?.startsWith('/lms/admin');

  useEffect(() => {
    // Get user from localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (error) {
      console.error('[LMSLayout] Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin routes have their own layout with navigation, don't wrap with LMSNavigation
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Regular LMS routes use LMSNavigation
  return (
    <div className="min-h-screen flex flex-col">
      <LMSNavigation user={user} showInstructorLink={true} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

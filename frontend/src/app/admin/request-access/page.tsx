/**
 * Request Access Page - OLD LOCATION
 * 
 * This page has been moved to /request-access
 * This file redirects to the new location
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestAccessPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new location
    router.replace('/request-access');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

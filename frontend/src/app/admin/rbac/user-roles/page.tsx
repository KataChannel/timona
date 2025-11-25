'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * User Role Assignment Page - Redirects to Unified Interface
 * 
 * This page has been merged with the User Management page for better UX.
 * All user role assignment functionality is now accessible through:
 * /admin/users?tab=rbac&subtab=assignments
 */
export default function UserRolesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users?tab=rbac&subtab=assignments');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting to User Role Assignments...</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RBACPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to unified admin users page with RBAC tab
    router.replace('/admin/users?tab=rbac');
  }, [router]);
  
  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecting to RBAC Management...</p>
      </div>
    </div>
  );
}

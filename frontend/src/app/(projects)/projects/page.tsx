'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/projects/dashboard');
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary sm:h-12 sm:w-12"></div>
        <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

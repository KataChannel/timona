'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main admin page for now
    router.replace('/admin');
  }, [router]);

  return null;
}
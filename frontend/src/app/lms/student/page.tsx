'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page: /lms/student → /lms/my-learning
 * 
 * Lý do: Route /lms/student đã bị deprecated và thay thế bằng /lms/my-learning
 * Page này chỉ để redirect user có bookmark cũ
 */
export default function StudentRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/lms/my-learning');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

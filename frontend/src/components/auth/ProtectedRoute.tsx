'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/auth-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'SUPERADMIN' | 'INSTRUCTOR' | 'USER' | 'GUEST')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // If roles are specified, check user role
    if (allowedRoles && allowedRoles.length > 0) {
      try {
        const payload = decodeToken(token);
        
        if (!payload) {
          console.error('Failed to decode token');
          router.push('/login');
          return;
        }
        
        const userRole = payload.roleType as 'ADMIN' | 'SUPERADMIN' | 'INSTRUCTOR' | 'USER' | 'GUEST';
        
        // Check if user role is allowed
        if (!allowedRoles.includes(userRole)) {
          console.warn(`❌ Access denied. User role: ${userRole}, Allowed roles: ${allowedRoles.join(', ')}`);
          
          // Redirect based on user's actual role
          switch (userRole) {
            case 'ADMIN':
            case 'SUPERADMIN':
              router.push('/lms/admin');
              break;
            case 'INSTRUCTOR':
              router.push('/lms/instructor');
              break;
            case 'USER':
              router.push('/lms/my-learning');
              break;
            default:
              router.push('/lms/courses');
          }
          return;
        }
        
        // User is authorized
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Failed to parse token:', error);
        router.push('/login');
        return;
      }
    } else {
      // No role check required, just check token exists
      setIsAuthorized(true);
      setIsChecking(false);
    }
  }, [router, allowedRoles]);

  // Show loading state while checking authorization
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}

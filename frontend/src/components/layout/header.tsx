'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteName } from '@/hooks/useSiteName';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { siteName } = useSiteName();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              {siteName}
            </Link>
          </div>
          
          {isAuthenticated ? (
            <>
              <nav className="hidden md:flex space-x-10">
                <Link href="/dashboard" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/todos" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Todos
                </Link>
                {/* Removed - Shared todos integrated into main todos page */}
                <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Documentation
                </a>
              </nav>
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <nav className="hidden md:flex space-x-10">
                <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Features
                </a>
                <a href="#tech-stack" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Tech Stack
                </a>
                <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Documentation
                </a>
              </nav>
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                <Link
                  href="/login"
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

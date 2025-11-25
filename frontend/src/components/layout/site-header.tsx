'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteName } from '@/hooks/useSiteName';

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { siteName } = useSiteName();

  const handleLogout = async () => {
    // Logout will handle redirect based on auth_logout_redirect setting
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              {siteName}
            </Link>
          </div>
          
          {isAuthenticated ? (
            <>
              <nav className="hidden md:flex space-x-10">
                <Link href="/demo" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Demo
                </Link>
               <Link href="/ketoan" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Kế Toán
                </Link>
                <a href="chatbot" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Chat Bot
                </a>
                <a href="website" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                 Website
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
                  className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <nav className="hidden md:flex space-x-10">
                <a href="#features" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Features
                </a>
                <a href="#tech-stack" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Tech Stack
                </a>
                <Link href="/demo" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Demo
                </Link>
                <a href="/chatbot" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Chatbot
                </a>
                <a href="/website" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  Website
                </a>
              </nav>
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                <Link
                  href="/login"
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

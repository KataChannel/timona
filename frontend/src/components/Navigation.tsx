'use client';

import Link from 'next/link';
import { Bot, Home, MessageSquare, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteName } from '@/hooks/useSiteName';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { siteName } = useSiteName();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                {siteName}
              </Link>
            </div>
            <div className="ml-6 flex space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
                >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                href="/chatbot"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 transition-colors"
                >
                <Bot className="h-4 w-4 mr-1" />
                Chatbots
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.username || user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

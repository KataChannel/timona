'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  BookOpen, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Home, 
  LayoutDashboard, 
  FileText,
  X,
  MessageSquare,
  Award
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const menuItems = [
  { 
    title: 'Tổng quan', 
    icon: LayoutDashboard, 
    href: '/lms/instructor' 
  },
  { 
    title: 'Khóa học của tôi', 
    icon: BookOpen, 
    href: '/lms/instructor/courses',
    children: [
      { title: 'Danh sách', href: '/lms/instructor/courses' },
      { title: 'Tạo khóa học', href: '/lms/instructor/courses/create' },
    ],
  },
  { 
    title: 'Tài liệu nguồn', 
    icon: FileText, 
    href: '/lms/instructor/source-documents',
    children: [
      { title: 'Danh sách', href: '/lms/instructor/source-documents' },
      { title: 'Thêm mới', href: '/lms/instructor/source-documents/new' },
    ],
  },
  { 
    title: 'Học viên', 
    icon: Users, 
    href: '/lms/instructor/students' 
  },
  { 
    title: 'Bài kiểm tra', 
    icon: ClipboardList, 
    href: '/lms/instructor/quizzes' 
  },
  { 
    title: 'Thảo luận', 
    icon: MessageSquare, 
    href: '/lms/instructor/discussions' 
  },
  { 
    title: 'Chứng chỉ', 
    icon: Award, 
    href: '/lms/instructor/certificates' 
  },
  { 
    title: 'Báo cáo', 
    icon: BarChart3, 
    href: '/lms/instructor/reports' 
  },
  { 
    title: 'Cài đặt', 
    icon: Settings, 
    href: '/lms/instructor/settings' 
  },
];

// Helper to check if user has admin role
const checkUserRole = () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        isAdmin: payload.roleType === 'ADMIN',
        userId: payload.sub
      };
    }
  } catch (error) {
    // Ignore error
  }
  return { isAdmin: false, userId: null };
};

function SidebarContent({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState({ isAdmin: false, userId: null });

  useEffect(() => {
    setUserRole(checkUserRole());
  }, []);

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-purple-900">Giảng viên</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Quản lý khóa học của bạn</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.title}</span>
                </button>
                
                {/* Submenu */}
                {item.children && isActive && (
                  <ul className="mt-1 ml-7 sm:ml-9 space-y-0.5">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(child.href);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs sm:text-sm transition-colors ${
                            pathname === child.href
                              ? 'text-purple-700 font-medium bg-purple-50/50'
                              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/30'
                          }`}
                        >
                          {child.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
        {/* Show admin link if user is ADMIN */}
        {userRole.isAdmin && (
          <button
            onClick={() => handleNavigation('/lms/admin')}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Quay lại Admin</span>
          </button>
        )}
        
        <button
          onClick={() => handleNavigation('/lms')}
          className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span>LMS Home</span>
        </button>
      </div>
    </>
  );
}

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (href: string) => {
    setSidebarOpen(false);
  };

  return (
    <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN', 'SUPERADMIN']}>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-900">Giảng viên</h2>
            <p className="text-xs text-gray-500">Quản lý khóa học</p>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[280px] sm:w-[320px] p-0 flex flex-col"
              title="Menu giảng viên"
            >
              <SidebarContent onNavigate={handleNavigation} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-gray-200 flex-col">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-[73px] lg:pt-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}


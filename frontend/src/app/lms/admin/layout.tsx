'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap,
  ClipboardList,
  BarChart3,
  Settings,
  Folder,
  UserCheck,
  Home,
  Menu,
  X,
  ShoppingBag,
  FileText,
  FolderTree,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface AdminLMSLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: 'Tổng quan',
    icon: LayoutDashboard,
    href: '/lms/admin',
  },
  {
    title: 'Khóa học',
    icon: BookOpen,
    href: '/lms/admin/courses',
    children: [
      { title: 'Danh sách', href: '/lms/admin/courses' },
      { title: 'Tạo khóa học', href: '/lms/admin/courses/create' },
    ],
  },
  {
    title: 'Danh mục',
    icon: Folder,
    href: '/lms/admin/categories',
  },
  {
    title: 'Tài liệu nguồn',
    icon: FileText,
    href: '/lms/admin/source-documents',
    children: [
      { title: 'Danh sách', href: '/lms/admin/source-documents' },
      { title: 'Thêm mới', href: '/lms/admin/source-documents/new' },
      { title: 'Danh mục', href: '/lms/admin/source-documents/categories' },
    ],
  },
  {
    title: 'Giảng viên',
    icon: GraduationCap,
    href: '/lms/admin/instructors',
  },
  {
    title: 'Học viên',
    icon: Users,
    href: '/lms/admin/students',
  },
  {
    title: 'Ghi danh',
    icon: UserCheck,
    href: '/lms/admin/enrollments',
  },
  {
    title: 'Phê duyệt',
    icon: CheckSquare,
    href: '/lms/admin/approvals',
  },
  {
    title: 'Bài kiểm tra',
    icon: ClipboardList,
    href: '/lms/admin/quizzes',
  },
  {
    title: 'Báo cáo',
    icon: BarChart3,
    href: '/lms/admin/reports',
  },
  {
    title: 'Cài đặt',
    icon: Settings,
    href: '/lms/admin/settings',
  },
];

export default function AdminLMSLayout({ children }: AdminLMSLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">LMS Admin</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Quản lý hệ thống học tập</p>
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
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
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
                              ? 'text-blue-700 font-medium bg-blue-50/50'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
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
        <button
          onClick={() => handleNavigation('/lms')}
          className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span>LMS Home</span>
        </button>
        <button
          onClick={() => handleNavigation('/admin')}
          className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Admin Panel
        </button>
      </div>
    </>
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">LMS Admin</h2>
            <p className="text-xs text-gray-500">Quản lý hệ thống</p>
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
              title="Menu quản lý LMS"
            >
              <SidebarContent />
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

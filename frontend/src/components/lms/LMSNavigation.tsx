'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  GraduationCap,
  Award,
  LayoutDashboard,
  Menu,
  X,
  Home,
  Library,
  Users,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: 'instructor' | 'student';
}

const mainNavigation: NavigationItem[] = [
  {
    name: 'Trang chủ',
    href: '/lms',
    icon: Home,
  },
  {
    name: 'Khóa học',
    href: '/lms/courses',
    icon: BookOpen,
  },
  {
    name: 'Học tập của tôi',
    href: '/lms/my-learning',
    icon: Library,
  },
  {
    name: 'Chứng chỉ',
    href: '/lms/my-certificates',
    icon: Award,
  },
];

const instructorNavigation: NavigationItem = {
  name: 'Dashboard Giảng viên',
  href: '/lms/instructor',
  icon: LayoutDashboard,
  requiredRole: 'instructor',
};

const adminNavigation: NavigationItem = {
  name: 'Quản trị LMS',
  href: '/lms/admin',
  icon: Settings,
};

interface LMSNavigationProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null;
}

export function LMSNavigation({ user: propUser }: LMSNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  
  // Use authUser from context if available, otherwise fallback to propUser
  const user = authUser || propUser;

  // Helper functions to check user roles
  const isAdmin = () => {
    if (!user) return false;
    const roleType = 'roleType' in user ? user.roleType : ('role' in user ? user.role : undefined);
    return roleType === 'ADMIN' || roleType === 'SUPERADMIN';
  };

  const isInstructor = () => {
    if (!user) return false;
    const roleType = 'roleType' in user ? user.roleType : ('role' in user ? user.role : undefined);
    return roleType === 'INSTRUCTOR' || isAdmin();
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return '';
    if ('name' in user && user.name) return user.name;
    if ('firstName' in user && 'lastName' in user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    if ('username' in user) return user.username;
    return user.email;
  };

  // Get user avatar
  const getUserAvatar = () => {
    if (!user) return undefined;
    if ('avatar' in user) return user.avatar;
    return undefined;
  };

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === '/lms') {
      return pathname === '/lms';
    }
    return pathname?.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavigationItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/lms" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold hidden sm:inline">LMS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            {isAdmin() && (
              <NavLink item={adminNavigation} />
            )}
            {isInstructor() && !isAdmin() && (
              <NavLink item={instructorNavigation} />
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={getUserAvatar()} alt={getUserName() || user.email} />
                      <AvatarFallback>
                        {getUserName()?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      {getUserName() && (
                        <p className="text-sm font-medium">{getUserName()}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/lms/my-learning">
                      <Library className="mr-2 h-4 w-4" />
                      Học tập của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/lms/my-certificates">
                      <Award className="mr-2 h-4 w-4" />
                      Chứng chỉ của tôi
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin() || isInstructor()) && (
                    <>
                      <DropdownMenuSeparator />
                      {isAdmin() && (
                        <DropdownMenuItem asChild>
                          <Link href="/lms/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            Quản trị LMS
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isInstructor() && !isAdmin() && (
                        <DropdownMenuItem asChild>
                          <Link href="/lms/instructor">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard Giảng viên
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <nav className="flex flex-col gap-1">
                    {mainNavigation.map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                    {isAdmin() && (
                      <NavLink item={adminNavigation} />
                    )}
                    {isInstructor() && !isAdmin() && (
                      <NavLink item={instructorNavigation} />
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

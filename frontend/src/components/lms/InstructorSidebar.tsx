'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const instructorNavigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/lms/instructor',
    icon: LayoutDashboard,
  },
  {
    name: 'Khóa học',
    href: '/lms/instructor/courses',
    icon: BookOpen,
  },
  {
    name: 'Học viên',
    href: '/lms/instructor/students',
    icon: Users,
  },
  {
    name: 'Thống kê',
    href: '/lms/instructor/analytics',
    icon: BarChart3,
  },
  {
    name: 'Cài đặt',
    href: '/lms/instructor/settings',
    icon: Settings,
  },
];

export function InstructorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/lms/instructor') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex flex-col w-full lg:w-64 lg:border-r lg:bg-muted/10 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Khu vực Giảng viên</h2>
          </div>
          <Button asChild className="w-full" size="sm">
            <Link href="/lms/instructor/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-2">
          <nav className="space-y-1">
            {instructorNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Link
            href="/lms"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại LMS
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  User,
  Bell,
  TrendingUp,
  Target,
  Link as LinkIcon,
  DollarSign,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { NavigationMenu } from './NavigationMenu';
import { UniversalSearch } from '@/components/search/universal-search';
import { useAdminMenus } from '@/lib/hooks/useMenus';
import { Loader2 } from 'lucide-react';
import { filterMenuByPermissions, debugMenuPermissions } from '@/lib/utils/permission-utils';
import { useSiteName } from '@/hooks/useSiteName';

interface AdminSidebarLayoutProps {
  children: React.ReactNode;
}

export function AdminSidebarLayout({ children }: AdminSidebarLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { siteName } = useSiteName();

  // Fetch dynamic menus from database with user permissions
  // Using Universal Dynamic Query System
  const { menus: dynamicMenus, loading: menusLoading, error: menusError } = useAdminMenus();

  // Memoized user identifier for stable filtering
  const userIdentifier = React.useMemo(() => ({
    id: user?.id,
    roleType: user?.roleType,
    roles: user?.roles?.map(r => r.id),
  }), [user?.id, user?.roleType, user?.roles]);

  // Fallback static navigation - MEMOIZED to prevent re-render issues
  const staticNavigation = React.useMemo(() => [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      requiredRoles: ['admin', 'super_admin', 'content_manager', 'content_editor', 'product_manager'],
    },
    {
      name: 'Users & RBAC',
      href: '/admin/users',
      icon: Users,
      requiredRoles: ['admin', 'super_admin', 'user_manager'],
    },
    {
      name: 'Content',
      href: '/admin/posts',
      icon: ClipboardList,
      requiredRoles: ['admin', 'super_admin', 'content_manager', 'content_editor'],
    },
    {
      name: 'Projects',
      href: '/admin/projects',
      icon: Target,
      requiredRoles: ['admin', 'super_admin', 'content_manager'],
    },
    {
      name: 'Tasks',
      href: '/admin/tasks',
      icon: CheckSquare,
      requiredRoles: ['admin', 'super_admin', 'content_manager'],
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      requiredRoles: ['admin', 'super_admin', 'content_manager'],
    },
    {
      name: 'Menu Management',
      href: '/admin/menu',
      icon: LinkIcon,
      requiredRoles: ['admin', 'super_admin', 'content_manager'],
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      requiredRoles: ['admin', 'super_admin'],
    },
  ], []);

  // Use dynamic menus if loaded, otherwise use static navigation
  const navigation = React.useMemo(() => {
    // SIMPLE: Use dynamic menus if available, otherwise static (no loading flapping)
    const menusToDisplay = (dynamicMenus && dynamicMenus.length > 0) ? dynamicMenus : staticNavigation;
    
    // 🔐 IMPORTANT: Filter menus based on user roles/permissions
    // This ensures normal users can't access admin menus
    const filteredMenus = filterMenuByPermissions(menusToDisplay, user);
    
    // Convert filtered menus to NavigationItem format (ensure href is set)
    const navigationItems = filteredMenus.map((item: any) => ({
      name: item.name || item.title || 'Menu',
      href: item.href || item.route || item.url || '/',
      icon: item.icon,
      children: item.children?.map((child: any) => ({
        name: child.name || child.title || 'Submenu',
        href: child.href || child.route || child.url || '/',
        icon: child.icon,
      })),
      badge: item.badge,
      badgeColor: item.badgeColor,
      target: item.target,
      metadata: item.metadata,
    }));
    
    return navigationItems as any;
  }, [dynamicMenus, userIdentifier, user]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.username || user.email || 'User';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative h-screen flex overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 transition-all duration-300 bg-card border-r',
          collapsed ? 'md:w-16' : 'md:w-64'
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!collapsed && (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2"
                >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">K</span>
                </div>
                <span className="font-semibold text-lg">{siteName}</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn('h-8 w-8', collapsed && 'mx-auto')}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  collapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            {menusLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : menusError ? (
              <>
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  <p>⚠️ Failed to load menus from database</p>
                  <p className="text-xs mt-1">Using default navigation</p>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="px-4 py-2 text-xs text-red-600">
                    <p>Error: {JSON.stringify(menusError)}</p>
                  </div>
                )}
                <NavigationMenu navigation={navigation} collapsed={collapsed} />
              </>
            ) : (
              <NavigationMenu navigation={navigation} collapsed={collapsed} />
            )}
          </ScrollArea>

          {/* User profile */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-auto p-2',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                      <span className="text-sm font-medium truncate w-full">
                        {user?.username || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user?.email || 'user@example.com'}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border shadow-lg z-[100]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer" >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer" >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-64 z-50 md:hidden bg-card border-r shadow-xl">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center space-x-2"
                  >
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">K</span>
                  </div>
                  <span className="font-semibold text-lg">{siteName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <ScrollArea className="flex-1 py-4">
                {menusLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : menusError ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    <p>Failed to load menu</p>
                    <p className="text-xs mt-1">Using default navigation</p>
                  </div>
                ) : (
                  <NavigationMenu navigation={navigation} collapsed={false} onItemClick={() => setMobileOpen(false)} />
                )}
              </ScrollArea>

              {/* User profile */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {user?.username || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}
      {/* Main content */}
      <div
        className={cn(
          'flex flex-col flex-1 w-full',
          'md:pl-64',
          collapsed && 'md:pl-16'
        )}
      >
        {/* Sticky header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="w-full max-w-sm hidden sm:block">
                <UniversalSearch />
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>

                {/* Mobile user menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border shadow-lg z-[100]">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user?.username || 'User'}</span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email || 'user@example.com'}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/profile" className="cursor-pointer" >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings" className="cursor-pointer" >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

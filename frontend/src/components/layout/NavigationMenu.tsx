'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any> | string;
  children?: NavigationItem[];
  badge?: string;
  badgeColor?: string;
  target?: string; // 'SELF' | 'BLANK' | 'MODAL'
  metadata?: {
    id?: string;
    type?: string;
    order?: number;
    level?: number;
    isProtected?: boolean;
    isActive?: boolean;
    isVisible?: boolean;
    isPublic?: boolean;
    slug?: string;
    description?: string;
    iconType?: string;
    cssClass?: string;
    customData?: any;
    externalUrl?: string | null;
    isExternal?: boolean;
    [key: string]: any;
  };
}

interface NavigationMenuProps {
  navigation: NavigationItem[];
  collapsed: boolean;
  onItemClick?: () => void;
}

export function NavigationMenu({ navigation, collapsed, onItemClick }: NavigationMenuProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemKey: string) => {
    setOpenItems(prev => 
      prev.includes(itemKey) 
        ? prev.filter(name => name !== itemKey)
        : [...prev, itemKey]
    );
  };

  // Helper to get icon component from string or component
  const getIconComponent = (icon: React.ComponentType<any> | string | undefined) => {
    if (!icon) return null;
    
    // If it's already a component, return it
    if (typeof icon === 'function') {
      return icon;
    }
    
    // If it's a string, try to get it from lucide-react
    if (typeof icon === 'string') {
      const IconComponent = (LucideIcons as any)[icon];
      return IconComponent || null;
    }
    
    return null;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasChildren = item.children && item.children.length > 0;
    // Create unique key using id if available, otherwise use href + name
    const itemKey = item.metadata?.id || `${item.href}-${item.name}`;
    const isOpen = openItems.includes(itemKey);
    
    // Get icon component (handles both string and component types)
    const IconComponent = getIconComponent(item.icon);
    if (hasChildren) {
      return (
        <div key={itemKey}>
          <Button
            variant="ghost"
            onClick={() => toggleItem(itemKey)}
            className={cn(
              'w-full justify-between gap-3 px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground',
              collapsed && 'justify-center',
              level > 0 && 'ml-4',
              item.metadata?.cssClass
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
              {!collapsed && (
                <>
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={cn("ml-auto text-xs", item.badgeColor)}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {!collapsed && (
              isOpen ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </Button>
          {!collapsed && isOpen && (
            <div className="space-y-1 ml-4">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Check if this is an external URL

    return (
      <Link
        key={itemKey}
        href={item.href}
        onClick={onItemClick}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground',
          collapsed && 'justify-center',
          level > 0 && 'ml-4',
          item.metadata?.cssClass
        )}
        title={collapsed ? item.name : item.metadata?.description || item.name}
      >
        {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
        {!collapsed && (
          <>
            <span className="truncate flex-1">{item.name}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn("text-xs ml-auto", item.badgeColor)}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navigation.map(item => renderNavigationItem(item))}
    </nav>
  );
}
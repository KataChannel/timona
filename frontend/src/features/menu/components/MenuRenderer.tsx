/**
 * Menu Feature - Menu Renderer Component
 * Clean Architecture - Presentation Layer
 * 
 * Mobile-first, responsive menu renderer với shadcn UI
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MenuItem, MenuTarget } from '../types/menu.types';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';

interface MenuRendererProps {
  items: MenuItem[];
  variant?: 'horizontal' | 'vertical' | 'mobile' | 'footer';
  className?: string;
  maxDepth?: number;
  onItemClick?: (item: MenuItem) => void;
}

/**
 * Component render menu với nhiều variant và responsive
 */
export function MenuRenderer({
  items,
  variant = 'horizontal',
  className,
  maxDepth = 3,
  onItemClick,
}: MenuRendererProps) {
  if (!items || items.length === 0) return null;

  const visibleItems = items.filter(item => item.isActive && item.isVisible);

  switch (variant) {
    case 'horizontal':
      return (
        <NavigationMenu className={className}>
          <NavigationMenuList>
            {visibleItems.map(item => (
              <HorizontalMenuItem
                key={item.id}
                item={item}
                maxDepth={maxDepth}
                onItemClick={onItemClick}
              />
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      );

    case 'vertical':
      return (
        <nav className={cn('space-y-1', className)}>
          {visibleItems.map(item => (
            <VerticalMenuItem
              key={item.id}
              item={item}
              depth={0}
              maxDepth={maxDepth}
              onItemClick={onItemClick}
            />
          ))}
        </nav>
      );

    case 'mobile':
      return (
        <nav className={cn('flex flex-col space-y-2', className)}>
          {visibleItems.map(item => (
            <MobileMenuItem
              key={item.id}
              item={item}
              depth={0}
              maxDepth={maxDepth}
              onItemClick={onItemClick}
            />
          ))}
        </nav>
      );

    case 'footer':
      return (
        <nav className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
          {visibleItems.map(item => (
            <FooterMenuColumn key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </nav>
      );

    default:
      return null;
  }
}

/**
 * Horizontal Menu Item (Desktop Navigation)
 */
function HorizontalMenuItem({
  item,
  maxDepth,
  onItemClick,
}: {
  item: MenuItem;
  maxDepth: number;
  onItemClick?: (item: MenuItem) => void;
}) {
  const hasChildren = item.children && item.children.length > 0 && item.level < maxDepth;
  const href = getMenuHref(item);

  if (hasChildren) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger className="gap-1">
          {item.icon && <MenuIcon icon={item.icon} />}
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {item.badge}
            </Badge>
          )}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            {item.children!.map(child => (
              <li key={child.id}>
                <NavigationMenuLink asChild>
                  <Link
                    href={getMenuHref(child)}
                    className={cn(
                      'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                      child.cssClass
                    )}
                    onClick={() => onItemClick?.(child)}
                  >
                    <div className="flex items-center gap-2">
                      {child.icon && <MenuIcon icon={child.icon} />}
                      <div className="text-sm font-medium leading-none">{child.title}</div>
                      {child.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                    {child.description && (
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {child.description}
                      </p>
                    )}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          className={cn(navigationMenuTriggerStyle(), item.cssClass)}
          onClick={() => onItemClick?.(item)}
        >
          {item.icon && <MenuIcon icon={item.icon} />}
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {item.badge}
            </Badge>
          )}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}

/**
 * Vertical Menu Item (Sidebar)
 */
function VerticalMenuItem({
  item,
  depth,
  maxDepth,
  onItemClick,
}: {
  item: MenuItem;
  depth: number;
  maxDepth: number;
  onItemClick?: (item: MenuItem) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0 && depth < maxDepth;
  const href = getMenuHref(item);

  return (
    <div className={cn('space-y-1', depth > 0 && 'ml-4')}>
      <Link
        href={href}
        className={cn(
          'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          item.cssClass
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
          onItemClick?.(item);
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.icon && <MenuIcon icon={item.icon} />}
          <span className="truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {item.badge}
            </Badge>
          )}
        </div>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </Link>

      {hasChildren && isOpen && (
        <div className="space-y-1">
          {item.children!.map(child => (
            <VerticalMenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile Menu Item (Mobile Navigation)
 */
function MobileMenuItem({
  item,
  depth,
  maxDepth,
  onItemClick,
}: {
  item: MenuItem;
  depth: number;
  maxDepth: number;
  onItemClick?: (item: MenuItem) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0 && depth < maxDepth;
  const href = getMenuHref(item);

  return (
    <div className={cn('space-y-2', depth > 0 && 'ml-6')}>
      <Link
        href={href}
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-base font-medium transition-colors',
          'active:bg-accent',
          depth === 0 && 'bg-accent/5',
          item.cssClass
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
          onItemClick?.(item);
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {item.icon && <MenuIcon icon={item.icon} className="h-5 w-5" />}
          <span className="truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {item.badge}
            </Badge>
          )}
        </div>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-transform flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </Link>

      {hasChildren && isOpen && (
        <div className="space-y-2">
          {item.children!.map(child => (
            <MobileMenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Footer Menu Column
 */
function FooterMenuColumn({
  item,
  onItemClick,
}: {
  item: MenuItem;
  onItemClick?: (item: MenuItem) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
      {hasChildren && (
        <ul className="space-y-2">
          {item.children!.map(child => (
            <li key={child.id}>
              <Link
                href={getMenuHref(child)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                onClick={() => onItemClick?.(child)}
              >
                {child.icon && <MenuIcon icon={child.icon} className="h-3 w-3" />}
                <span>{child.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Menu Icon Component
 */
function MenuIcon({ icon, className }: { icon: string; className?: string }) {
  // TODO: Integrate with icon library (lucide-react, react-icons, etc.)
  return <span className={cn('inline-block', className)}>{icon}</span>;
}

/**
 * Get href from menu item based on link type
 * Routes theo chuẩn:
 * - List sản phẩm: /san-pham
 * - Detail sản phẩm: /san-pham/[slug]
 * - List bài viết: /bai-viet
 * - Detail bài viết: /bai-viet/[slug]
 */
function getMenuHref(item: MenuItem): string {
  switch (item.linkType) {
    case 'EXTERNAL':
      return item.externalUrl || '#';
    case 'ROUTE':
      return item.route || '#';
    case 'PAGE':
      return item.pageId ? `/page/${item.pageId}` : '#';
    case 'PRODUCT_LIST':
      return '/san-pham';
    case 'PRODUCT_DETAIL': {
      // Ưu tiên slug từ customData, fallback về ID
      const productSlug = item.customData?.productSlug;
      if (productSlug) {
        return `/san-pham/${productSlug}`;
      }
      return item.productId ? `/san-pham/${item.productId}` : '#';
    }
    case 'BLOG_LIST':
      return '/bai-viet';
    case 'BLOG_DETAIL': {
      // Ưu tiên slug từ customData, fallback về ID
      const blogPostSlug = item.customData?.blogPostSlug;
      if (blogPostSlug) {
        return `/bai-viet/${blogPostSlug}`;
      }
      return item.blogPostId ? `/bai-viet/${item.blogPostId}` : '#';
    }
    case 'CATEGORY':
      return item.categoryId ? `/danh-muc/${item.categoryId}` : '#';
    case 'BLOG_CATEGORY':
      return item.blogCategoryId ? `/bai-viet/danh-muc/${item.blogCategoryId}` : '#';
    default:
      return item.url || '#';
  }
}

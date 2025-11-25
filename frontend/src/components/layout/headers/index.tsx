'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { HeaderProps } from '@/types/layout';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const DEFAULT_VARIANT = 'default' as const;

/**
 * Default Header Variant
 * Standard header with logo left, menu center, actions right
 */
export function DefaultHeader({
  brand = { name: 'rausachcore', tagline: 'Enterprise Starter Kit' },
  menuItems = [],
  showSearch = true,
  showCart = false,
  showAuth = true,
  backgroundColor = 'bg-white',
  textColor = 'text-gray-900',
  ctaButton,
  sticky = false,
  transparent = false,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'w-full border-b',
        sticky && 'sticky top-0 z-50',
        transparent ? 'bg-transparent border-transparent' : backgroundColor,
        textColor
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {brand.logo && (
                <img src={brand.logo} alt={brand.name} className="h-8 w-auto" />
              )}
              <span className="text-xl font-bold">{brand.name}</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          {menuItems.length > 0 && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {menuItems.map((item, index) => (
                  <NavigationMenuItem key={index}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                            {item.children.map((child, childIndex) => (
                              <li key={childIndex}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={child.href}
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium">{child.label}</div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={item.href} className="px-4 py-2 hover:text-primary">
                        {item.label}
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {showSearch && (
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            )}
            {showCart && (
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}
            {showAuth && (
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            )}
            {ctaButton && (
              <Button variant={ctaButton.variant || DEFAULT_VARIANT} asChild>
                <Link href={ctaButton.href}>{ctaButton.text}</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Minimal Header Variant
 * Compact header with just logo and CTA
 */
export function MinimalHeader({
  brand = { name: 'rausachcore' },
  backgroundColor = 'bg-white',
  textColor = 'text-gray-900',
  ctaButton,
}: HeaderProps) {
  return (
    <header className={cn('w-full border-b', backgroundColor, textColor)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-lg font-bold">
            {brand.name}
          </Link>
          {ctaButton && (
            <Button variant={ctaButton.variant || DEFAULT_VARIANT} size="sm" asChild>
              <Link href={ctaButton.href}>{ctaButton.text}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Centered Header Variant
 * Logo and menu centered
 */
export function CenteredHeader({
  brand = { name: 'rausachcore', tagline: 'Enterprise Starter Kit' },
  menuItems = [],
  backgroundColor = 'bg-white',
  textColor = 'text-gray-900',
  ctaButton,
}: HeaderProps) {
  return (
    <header className={cn('w-full border-b', backgroundColor, textColor)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Logo Centered */}
        <div className="flex justify-center mb-4">
          <Link href="/" className="text-center">
            <div className="text-2xl font-bold">{brand.name}</div>
            {brand.tagline && (
              <div className="text-sm text-gray-500">{brand.tagline}</div>
            )}
          </Link>
        </div>

        {/* Menu Centered */}
        {menuItems.length > 0 && (
          <nav className="flex justify-center space-x-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* CTA Centered */}
        {ctaButton && (
          <div className="flex justify-center mt-4">
            <Button variant={ctaButton.variant || DEFAULT_VARIANT} asChild>
              <Link href={ctaButton.href}>{ctaButton.text}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Mega Menu Header Variant
 * Header with large dropdown menus
 */
export function MegaHeader({
  brand = { name: 'rausachcore' },
  menuItems = [],
  backgroundColor = 'bg-white',
  textColor = 'text-gray-900',
  showSearch = true,
  ctaButton,
}: HeaderProps) {
  return (
    <header className={cn('w-full border-b', backgroundColor, textColor)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            {brand.name}
          </Link>

          {/* Mega Menu */}
          {menuItems.length > 0 && (
            <nav className="hidden lg:flex space-x-8">
              {menuItems.map((item, index) => (
                <div key={index} className="relative group">
                  <button className="text-sm font-medium hover:text-primary">
                    {item.label}
                  </button>
                  {item.children && (
                    <div className="absolute top-full left-0 hidden group-hover:block w-[600px] bg-white border shadow-lg p-6 mt-2">
                      <div className="grid grid-cols-3 gap-4">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.href}
                            className="block p-3 rounded hover:bg-gray-50"
                          >
                            <div className="font-medium">{child.label}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative hidden md:block">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            )}
            {ctaButton && (
              <Button variant={ctaButton.variant || DEFAULT_VARIANT} asChild>
                <Link href={ctaButton.href}>{ctaButton.text}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

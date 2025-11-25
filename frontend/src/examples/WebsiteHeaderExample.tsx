/**
 * EXAMPLE: Website Header Component
 * Sử dụng refactored menu system
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MenuRenderer, useHeaderMenu } from '@/features/menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Modern website header với menu integration
 */
export function WebsiteHeaderExample() {
  const { tree, loading } = useHeaderMenu();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (loading) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="font-bold text-xl hidden sm:inline-block">
              Your Brand
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <MenuRenderer 
              items={tree} 
              variant="horizontal"
              onItemClick={(item) => {
                console.log('Menu clicked:', item.title);
              }}
            />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-80 p-0" title="Menu điều hướng">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
                      <span className="font-bold text-xl">Your Brand</span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 overflow-y-auto p-4">
                    <MenuRenderer 
                      items={tree} 
                      variant="mobile"
                      onItemClick={(item) => {
                        console.log('Mobile menu clicked:', item.title);
                        setMobileMenuOpen(false);
                      }}
                    />
                  </nav>

                  {/* Mobile Footer */}
                  <div className="p-4 border-t space-y-2">
                    <Button className="w-full" variant="default">
                      <User className="h-4 w-4 mr-2" />
                      Đăng Nhập
                    </Button>
                    <Button className="w-full" variant="outline">
                      Đăng Ký
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Loading skeleton for header
 */
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="hidden lg:flex items-center space-x-6">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}

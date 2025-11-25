'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useScroll } from '@/contexts/ScrollContext';
// ✅ MIGRATED: Import Dynamic GraphQL
import { useFindMany } from '@/hooks/useDynamicGraphQL';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_PUBLIC_MENUS } from '@/graphql/menu.queries';
import { GET_PRODUCTS } from '@/graphql/product.queries';
import { useHeaderSettings, useContactSettings, settingsToMap } from '@/hooks/useWebsiteSettings';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Phone, Search, ShoppingCart, User, LogIn, Heart, Package, Menu, ChevronRight, X, TrendingUp, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function WebsiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { isScrolled } = useScroll();
  const router = useRouter();
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ✅ Search Products Query
  const [searchProducts, { loading: searchLoading, data: searchData }] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'network-only',
  });

  // Reset search when dialog is closed
  useEffect(() => {
    if (!showSearchPopup) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [showSearchPopup]);

  // ✅ Handle search input change with debounce
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    
    // Only search if query has at least 2 characters
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      console.log('Searching for:', trimmedQuery);
      
      searchProducts({
        variables: {
          input: {
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            filters: {
              search: trimmedQuery,
              status: 'ACTIVE', // Only show active products
            },
          },
        },
      }).catch((error) => {
        console.error('Search error:', error);
        setSearchResults([]);
      });
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  // ✅ Update search results when data changes
  useEffect(() => {
    // Only update results if we have a valid search query
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return; // Don't update if query is empty
    }
    
    if (searchData?.products?.items) {
      console.log('Search results for "' + searchQuery + '":', searchData.products.items.length, 'products found');
      console.log('First result:', searchData.products.items[0]?.name);
      setSearchResults(searchData.products.items);
    } else if (searchData?.products && !searchData.products.items) {
      // Handle case where query succeeded but no items
      console.log('Search completed but no items found');
      setSearchResults([]);
    }
  }, [searchData, searchQuery]);

  // ✅ Load Header Settings
  const { data: headerSettingsRaw = [], loading: headerLoading } = useHeaderSettings();
  const headerSettings = useMemo(() => settingsToMap(headerSettingsRaw), [headerSettingsRaw]);

  // ✅ Load Contact Settings
  const { data: contactSettingsRaw = [], loading: contactLoading } = useContactSettings();
  const contactSettings = useMemo(() => settingsToMap(contactSettingsRaw), [contactSettingsRaw]);

  // ✅ MIGRATED: Fetch header menus with Dynamic GraphQL
  // Note: If authentication fails, fallback to empty array (no menu items)
  // ✅ USE PUBLIC MENU QUERY: No authentication required
  const { data, loading: menuLoading, error: menuError } = useQuery(GET_PUBLIC_MENUS, {
    variables: {
      type: 'HEADER',
      isActive: true,
      isVisible: true,
      orderBy: { order: 'asc' },
      includeChildren: true,
    },
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  const headerMenus = data?.publicMenus || [];

  // Log any errors (shouldn't happen with public query)
  useEffect(() => {
    if (menuError) {
      console.error('[WebsiteHeader] Failed to load menu:', menuError.message);
    }
  }, [menuError]);

  console.log('headerSettings', headerSettings);
  console.log('contactSettings', contactSettings);
  console.log('headerMenus',headerMenus);
  
  // Banner data
  const bannerItems = [
    {
      id: 1,
      title: "Khuyến Mãi Đặc Biệt",
      subtitle: "Giảm giá lên đến 50% cho tất cả sản phẩm",
      description: "Ưu đãi có thời hạn - Nhanh tay đặt hàng!",
      image: "/assets/images/tunongtraidenbanan.jpg",
      cta: "Mua Ngay",
      badge: "HOT",
      bgColor: ""
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<any>();

  // Auto-slide functionality
  useEffect(() => {
    if (!api) return;

    const timer = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [api]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchPopup(false);
      setSearchQuery('');
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper: render mobile menu item
  const renderMobileMenuItem = (item: any) => {
    if (!item.isVisible || !item.isActive) return null;

    const href = item.route || item.url || '#';
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) {
      return (
        <AccordionItem key={item.id} value={`item-${item.id}`}>
          <AccordionTrigger className="text-sm font-medium hover:text-primary">
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
            {item.badge && <Badge className="ml-2 text-xs">{item.badge}</Badge>}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-2 pl-4">
              {item.children.map((child: any) => {
                const childHref = child.route || child.url || '#';
                return (
                  <Link
                    key={child.id}
                    href={childHref}
                    className="text-sm py-2 hover:text-primary transition-colors"
                    target={child.target === 'BLANK' ? '_blank' : undefined}
                    rel={child.target === 'BLANK' ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ChevronRight className="w-4 h-4 inline mr-2" />
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    } else {
      return (
        <div key={item.id} className="border-b last:border-0">
          <Link
            href={href}
            className="flex items-center py-3 text-sm font-medium hover:text-primary transition-colors"
            target={item.target === 'BLANK' ? '_blank' : undefined}
            rel={item.target === 'BLANK' ? 'noopener noreferrer' : undefined}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
            {item.badge && <Badge className="ml-2 text-xs">{item.badge}</Badge>}
          </Link>
        </div>
      );
    }
  };

  // Helper: render desktop menu item
  const renderDesktopMenuItem = (item: any) => {
    if (!item.isVisible || !item.isActive) return null;

    const href = item.route || item.url || '#';
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.id} className="relative group">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-blue-200 transition-colors">
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
            {item.badge && <Badge className="ml-2 text-xs">{item.badge}</Badge>}
            <ChevronRight className="w-4 h-4 ml-1 rotate-90" />
          </button>
          <div className="absolute left-0 mt-0 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              {item.children.map((child: any) => {
                const childHref = child.route || child.url || '#';
                return (
                  <Link
                    key={child.id}
                    href={childHref}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                    target={child.target === 'BLANK' ? '_blank' : undefined}
                    rel={child.target === 'BLANK' ? 'noopener noreferrer' : undefined}
                  >
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <Link
          key={item.id}
          href={href}
          className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-blue-200 transition-colors"
          target={item.target === 'BLANK' ? '_blank' : undefined}
          rel={item.target === 'BLANK' ? 'noopener noreferrer' : undefined}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.title}
          {item.badge && <Badge className="ml-2 text-xs">{item.badge}</Badge>}
        </Link>
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* =============== MOBILE LAYOUT (< lg) =============== */}
      <div className="lg:hidden">
        {/* Mobile Top Bar */}
        <div 
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: headerSettings['header.background_color'] || '#57A345' }}
        >
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              
              {/* Mobile Menu Items */}
              <Accordion type="single" collapsible className="w-full">
                {menuLoading ? (
                  <div className="text-sm py-4">Đang tải menu...</div>
                ) : menuError ? (
                  <div className="text-red-500 text-sm py-4">Lỗi tải menu</div>
                ) : (
                  headerMenus
                    .filter((item: any) => (item.level === 0 || item.level === 1) && item.isActive && item.isVisible)
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((item: any) => renderMobileMenuItem(item))
                )}
              </Accordion>

              <Separator className="my-4" />

              {/* Mobile User Actions */}
              <div className="flex flex-col space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        router.push('/don-hang');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Đơn hàng của tôi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        router.push('/admin');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user.email}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      router.push('/login?redirect=/');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Logo */}
          <Link href="/" className="flex justify-center bg-white rounded-lg px-2 py-1">
            <img 
              src={headerSettings['header.logo'] || '/assets/images/logo.svg'} 
              alt="Logo" 
              className="h-12"
            />
          </Link>

          {/* Mobile Notifications & Cart */}
          <div className="flex items-center gap-1">
            <NotificationBell />
            
            {headerSettings['header.show_cart'] && (
              <Button
                variant="ghost"
                size="sm"
                className="relative text-white hover:bg-white/10"
                onClick={() => router.push('/gio-hang')}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search & Contact */}
        {headerSettings['header.show_search'] && (
          <div className="px-4 py-3 bg-gray-50 space-y-3">
            {/* Phone */}
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-[#FAA61A]" />
              <a 
                href={`tel:${contactSettings['contact.phone'] || '0865770009'}`} 
                className="text-[#FAA61A] font-bold"
              >
                {contactSettings['contact.phone_display'] || '0865.77.0009'}
              </a>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute inset-y-0 right-0 h-full px-3"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* =============== DESKTOP LAYOUT (>= lg) =============== */}
      <div className="hidden lg:block">
        {/* Carousel Banner */}
        {headerSettings['header.banner_enabled'] && (
          <div 
            className={cn(
              "relative overflow-hidden transition-all duration-500 ease-in-out",
              isScrolled && "max-h-0 opacity-0"
            )}
            style={{
              maxHeight: isScrolled ? '0' : `${headerSettings['header.banner_height'] || 208}px`,
            }}
          >
            <Carousel 
              className="w-full mx-auto"
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {bannerItems.map((item, index) => (
                  <CarouselItem key={item.id}>
                    <div className="relative">
                      <Card className="border-0 rounded-none">
                        <CardContent className={`relative p-0 ${item.bgColor} overflow-hidden`}>
                          <div className="relative z-10 h-full flex items-center">
                            <div className="mx-auto">
                                <div 
                                  className="w-full overflow-hidden shadow-2xl flex-shrink-0"
                                  style={{ height: `${headerSettings['header.banner_height'] || 208}px` }}
                                >
                                  <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                  />
                                </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/40 transition-all duration-300 backdrop-blur-sm" />
              <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/40 transition-all duration-300 backdrop-blur-sm" />
            </Carousel>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {bannerItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  onClick={() => {
                    if (api) {
                      api.scrollTo(index);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Desktop Main Header */}
        <div className="w-full mx-auto transition-shadow duration-300 ease-in-out">
          <div 
            className={cn(
              "grid grid-cols-12 items-center transition-shadow duration-300 ease-in-out",
              isScrolled && "shadow-lg"
            )}
            style={{ backgroundColor: headerSettings['header.background_color'] || '#57A345' }}
          >
            {/* Logo */}
            <div className={cn(
              "bg-white col-span-4 flex justify-end rounded-e-full pe-8 transition-all duration-500 ease-in-out",
              isScrolled ? "p-2" : "p-4"
            )}>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                <img 
                  src={headerSettings['header.logo'] || '/assets/images/logo.svg'} 
                  alt="Logo" 
                  className={cn(
                    "transition-all duration-500 ease-in-out transform",
                    isScrolled ? "max-h-12 scale-95" : "max-h-20 scale-100"
                  )}
                  style={{ 
                    height: isScrolled 
                      ? `${Math.min(headerSettings['header.logo_width'] || 80, 48)}px`
                      : `${headerSettings['header.logo_width'] || 80}px`,
                    maxHeight: isScrolled ? '48px' : `${headerSettings['header.logo_width'] || 80}px`
                  }}
                />
              </Link>
            </div>  

            {/* Navigation & Search */}
            <div className={cn(
              "col-span-5 flex flex-col transition-all duration-500 ease-in-out",
              isScrolled ? "space-y-1 py-2" : "space-y-2 py-4"
            )}>
              {/* Menu */}
              <nav className="flex items-center justify-center space-x-1">
                {menuLoading ? (
                  <div className="text-white text-sm">Đang tải menu...</div>
                ) : menuError ? (
                  <div className="text-red-200 text-sm">Lỗi tải menu</div>
                ) : (
                  headerMenus
                    .filter((item: any) => (item.level === 0 || item.level === 1) && item.isActive && item.isVisible)
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((item: any) => renderDesktopMenuItem(item))
                )}
                
                {/* Search Icon - Show when scrolled */}
                {headerSettings['header.show_search'] && isScrolled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-blue-200 hover:bg-white/10 transition-all ml-2"
                    onClick={() => setShowSearchPopup(true)}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                )}
              </nav>

              {/* Search Bar - Hidden when scrolled */}
              {headerSettings['header.show_search'] && (
                <div className={cn(
                  "flex flex-row items-center max-w-lg mx-auto px-4 space-x-4 transition-all duration-500 ease-in-out overflow-hidden",
                  isScrolled ? "max-h-0 opacity-0 py-0" : "max-h-20 opacity-100 py-2"
                )}>
                  <Phone className={cn(
                    "w-8 h-8 text-[#FAA61A] transition-all duration-500 ease-in-out",
                    isScrolled ? "scale-0" : "scale-100"
                  )} />
                  <a 
                    href={`tel:${contactSettings['contact.phone'] || '0865770009'}`} 
                    className={cn(
                      "text-lg text-[#FAA61A] font-bold whitespace-nowrap transition-all duration-500 ease-in-out",
                      isScrolled ? "scale-0 w-0" : "scale-100"
                    )}
                  >
                    {contactSettings['contact.phone_display'] || '0865.77.0009'}
                  </a>
                  <form onSubmit={handleSearch} className={cn(
                    "relative flex-1 transition-all duration-500 ease-in-out",
                    isScrolled ? "scale-0 w-0" : "scale-100"
                  )}>
                    <Input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-white/90 backdrop-blur-sm border-white/20 focus:bg-white focus:border-blue-300 transition-all duration-500 ease-in-out"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                    >
                      <Search className={cn(
                        "w-4 h-4 transition-all duration-500 ease-in-out",
                        isScrolled ? "scale-0" : "scale-100"
                      )} />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* User Actions */}
            <div className="col-span-2 flex items-center justify-end space-x-3 text-white pr-4">
              {/* Notifications */}
              <div className="[&_button]:text-white [&_button:hover]:text-blue-200 [&_button:hover]:bg-white/10">
                <NotificationBell />
              </div>

              {/* Orders */}
              {isAuthenticated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="relative p-2 text-white hover:text-blue-200 hover:bg-white/10 transition-all"
                        onClick={() => router.push('/don-hang')}
                      >
                        <Package className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Đơn hàng của tôi</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* User Profile */}
              {headerSettings['header.show_user_menu'] && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        {isAuthenticated && user ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full p-0 text-white font-semibold"
                            onClick={() => router.push('/admin')}
                          >
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex items-center space-x-1 px-3 py-2 text-white hover:text-blue-200 hover:bg-white/10 transition-all"
                            onClick={() => router.push('/login?redirect=/')}
                          >
                            <LogIn className="w-4 h-4" />
                            <span className="text-sm font-medium">Đăng nhập</span>
                          </Button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isAuthenticated && user ? user.email : 'Đăng nhập để tiếp tục'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Shopping Cart */}
              {headerSettings['header.show_cart'] && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="relative p-2 text-white hover:text-blue-200 hover:bg-white/10 transition-all"
                        onClick={() => router.push('/gio-hang')}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {cartItemCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Giỏ hàng {cartItemCount > 0 && `(${cartItemCount})`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>    
          </div>
        </div>
      </div>

      {/* Search Popup Dialog - Mobile First */}
      <Dialog open={showSearchPopup} onOpenChange={(open) => {
        setShowSearchPopup(open);
        if (!open) {
          setSearchQuery('');
          setSearchResults([]);
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-green-600" />
              Tìm kiếm sản phẩm
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {/* Search Input */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm (ví dụ: rau cải, củ cải...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Search Results */}
            <div className="px-6 py-4">
              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">Đang tìm kiếm...</span>
                </div>
              )}

              {!searchLoading && searchQuery.length > 0 && searchQuery.length < 2 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nhập ít nhất 2 ký tự để tìm kiếm</p>
                </div>
              )}

              {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không tìm thấy sản phẩm nào</p>
                  <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">
                      Tìm thấy <span className="font-semibold text-green-600">{searchResults.length}</span> sản phẩm
                    </p>
                    {searchResults.length === 10 && (
                      <button
                        onClick={() => {
                          router.push(`/san-pham?search=${encodeURIComponent(searchQuery)}`);
                          setShowSearchPopup(false);
                        }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {searchResults.map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/san-pham/${product.slug}`}
                      onClick={() => setShowSearchPopup(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-600 font-semibold text-base">
                            {product.price?.toLocaleString('vi-VN')}đ
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-gray-400 line-through text-sm">
                              {product.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                        {product.category && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.category.name}
                          </p>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="flex-shrink-0">
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            Còn hàng
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            Hết hàng
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Quick search suggestions */}
              {searchQuery.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-sm font-medium">Từ khóa phổ biến:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Rau sạch', 'Rau hữu cơ', 'Củ quả', 'Trái cây', 'Rau ăn lá', 'Cà chua', 'Rau muống'].map((keyword) => (
                      <Button
                        key={keyword}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(keyword);
                        }}
                        className="hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                      >
                        {keyword}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-gray-500">
                Nhấn Enter hoặc nút Tìm để xem kết quả đầy đủ
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSearchPopup(false)}
                size="sm"
              >
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

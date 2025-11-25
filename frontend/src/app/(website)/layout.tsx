'use client';

import { WebsiteFooter } from '@/components/layout/website-footer';
import { WebsiteHeader } from '@/components/layout/website-header';
import { CartProvider } from '@/contexts/CartContext';
import { ScrollProvider, useScroll } from '@/contexts/ScrollContext';
import { useWebsiteSetting } from '@/hooks/useWebsiteSettings';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface websiteLayoutProps {
  children: ReactNode;
}

function WebsiteLayoutContent({ children, showHeader, showFooter }: websiteLayoutProps & { showHeader: boolean; showFooter: boolean }) {
  const { isScrolled, scrollThreshold } = useScroll();

  // Calculate margin-top: scrollThreshold * 2 when scrolled
  const mainMarginTop = isScrolled ? scrollThreshold * 3 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && <WebsiteHeader />}
      <main 
        className={cn(
          "flex-1 transition-all duration-500 ease-in-out"
        )}
        style={{ 
          marginTop: `${mainMarginTop}px` 
        }}
      >
        {children}
      </main>
      {showFooter && <WebsiteFooter />}
    </div>
  );
}

export default function websiteLayout({ children }: websiteLayoutProps) {
  // Load header/footer visibility settings
  const { value: headerEnabled, loading: headerLoading } = useWebsiteSetting('header.enabled');
  const { value: footerEnabled, loading: footerLoading } = useWebsiteSetting('footer.enabled');

  // Default to true if loading or not set
  const showHeader = headerLoading ? true : (headerEnabled !== false);
  const showFooter = footerLoading ? true : (footerEnabled !== false);

  return (
    <CartProvider>
      <ScrollProvider threshold={50}>
        <WebsiteLayoutContent showHeader={showHeader} showFooter={showFooter}>
          {children}
        </WebsiteLayoutContent>
      </ScrollProvider>
    </CartProvider>
  );
}

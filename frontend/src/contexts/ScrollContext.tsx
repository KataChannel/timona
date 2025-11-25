'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ScrollContextType {
  isScrolled: boolean;
  scrollThreshold: number;
}

const ScrollContext = createContext<ScrollContextType>({
  isScrolled: false,
  scrollThreshold: 20,
});

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within ScrollProvider');
  }
  return context;
}

interface ScrollProviderProps {
  children: ReactNode;
  threshold?: number;
}

export function ScrollProvider({ children, threshold = 50 }: ScrollProviderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    const hysteresis = 20; // Buffer zone to prevent jitter

    const handleScroll = () => {
      if (rafId) return; // Skip if already scheduled

      rafId = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;

        // Hysteresis logic: different thresholds for scrolling up vs down
        if (isScrolled) {
          // Currently scrolled - need to scroll up past threshold - hysteresis to unscroll
          if (scrollPosition < threshold - hysteresis) {
            setIsScrolled(false);
          }
        } else {
          // Currently not scrolled - need to scroll down past threshold + hysteresis to scroll
          if (scrollPosition > threshold + hysteresis) {
            setIsScrolled(true);
          }
        }

        rafId = null;
      });
    };

    // Initial check
    handleScroll();

    // Add event listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isScrolled, threshold]);

  return (
    <ScrollContext.Provider value={{ isScrolled, scrollThreshold: threshold }}>
      {children}
    </ScrollContext.Provider>
  );
}

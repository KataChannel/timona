import { useState, useEffect } from 'react';

/**
 * Mounted Hook
 * 
 * Returns true after component mounts on the client
 * Prevents hydration errors in SSR/Next.js applications
 * 
 * @example
 * ```tsx
 * const isMounted = useMounted();
 * 
 * // Only render client-side code after mount
 * return (
 *   <div>
 *     {isMounted && <ClientOnlyComponent />}
 *   </div>
 * );
 * ```
 */

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Client-Only Render Hook
 * 
 * Returns a component only on the client side
 * Useful for components that rely on browser APIs
 * 
 * @example
 * ```tsx
 * const ClientMap = useClientOnly(() => <Map />);
 * 
 * return (
 *   <div>
 *     {ClientMap}
 *   </div>
 * );
 * ```
 */

export function useClientOnly(
  render: () => React.ReactNode,
  fallback?: React.ReactNode
): React.ReactNode {
  const isMounted = useMounted();

  if (!isMounted) {
    return fallback || null;
  }

  return render();
}

/**
 * Is Browser Hook
 * 
 * Checks if code is running in browser environment
 * Useful for accessing window, document, localStorage, etc.
 * 
 * @example
 * ```tsx
 * const isBrowser = useIsBrowser();
 * 
 * const theme = isBrowser 
 *   ? localStorage.getItem('theme') 
 *   : 'light';
 * ```
 */

export function useIsBrowser(): boolean {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  return isBrowser;
}

/**
 * Hydration Safe Hook
 * 
 * Returns safe values for server and client rendering
 * Prevents hydration mismatches
 * 
 * @example
 * ```tsx
 * const value = useHydrationSafe(
 *   () => localStorage.getItem('theme'), // Client
 *   'light'                                // Server fallback
 * );
 * ```
 */

export function useHydrationSafe<T>(
  clientValue: () => T,
  serverValue: T
): T {
  const [value, setValue] = useState<T>(serverValue);
  const isMounted = useMounted();

  useEffect(() => {
    if (isMounted) {
      setValue(clientValue());
    }
  }, [isMounted, clientValue]);

  return value;
}

/**
 * Window Size Hook
 * 
 * Returns current window dimensions
 * SSR-safe with optional initial values
 * 
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * 
 * const isMobile = width < 768;
 * 
 * return (
 *   <div>
 *     Window: {width} x {height}
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </div>
 * );
 * ```
 */

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(
  initialWidth: number = 1920,
  initialHeight: number = 1080
): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: initialWidth,
    height: initialHeight,
  });
  const isMounted = useMounted();

  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  return windowSize;
}

/**
 * Media Query Hook
 * 
 * Listens to CSS media query matches
 * SSR-safe with fallback value
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * 
 * return (
 *   <div>
 *     {isMobile ? <MobileView /> : <DesktopView />}
 *     {isDark && <DarkModeIcon />}
 *   </div>
 * );
 * ```
 */

export function useMediaQuery(
  query: string,
  fallback: boolean = false
): boolean {
  const [matches, setMatches] = useState(fallback);
  const isMounted = useMounted();

  useEffect(() => {
    if (!isMounted) return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query, isMounted]);

  return matches;
}

/**
 * Is Online Hook
 * 
 * Checks if user is online
 * SSR-safe, defaults to true
 * 
 * @example
 * ```tsx
 * const isOnline = useIsOnline();
 * 
 * return (
 *   <div>
 *     {!isOnline && (
 *       <Banner>You are offline</Banner>
 *     )}
 *   </div>
 * );
 * ```
 */

export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  const isMounted = useMounted();

  useEffect(() => {
    if (!isMounted) return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMounted]);

  return isOnline;
}

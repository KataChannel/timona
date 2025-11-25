import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Debounce hook for search and filter inputs
 * Delays function execution until after wait period
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = useDebounce((value: string) => {
 *   fetchData(value);
 * }, 300);
 * 
 * <Input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Throttle hook for limiting function execution rate
 * Ensures function is called at most once per interval
 * 
 * @param callback - Function to throttle
 * @param limit - Time limit in milliseconds (default: 300ms)
 * @returns Throttled function
 * 
 * @example
 * const throttledScroll = useThrottle((e: Event) => {
 *   handleScroll(e);
 * }, 100);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}

/**
 * Intersection Observer hook for lazy loading
 * Detects when element enters viewport
 * 
 * @param options - IntersectionObserver options
 * @returns [ref, isIntersecting]
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver();
 * 
 * <div ref={ref}>
 *   {isVisible && <HeavyComponent />}
 * </div>
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const nodeRef = useRef<Element | null>(null);

  const callbackRef = useCallback((node: Element | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    if (!nodeRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(nodeRef.current);

    return () => {
      observer.disconnect();
    };
  }, [nodeRef.current, options]);

  return [callbackRef, isIntersecting];
}

/**
 * Local storage hook with automatic serialization
 * Persists state to localStorage
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value
 * @returns [value, setValue, removeValue]
 * 
 * @example
 * const [filters, setFilters, clearFilters] = useLocalStorage('hr-filters', {});
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Window size hook for responsive designs
 * Tracks window dimensions with debouncing
 * 
 * @param debounceMs - Debounce delay (default: 150ms)
 * @returns { width, height, isMobile, isTablet, isDesktop }
 * 
 * @example
 * const { isMobile } = useWindowSize();
 * 
 * {isMobile ? <MobileView /> : <DesktopView />}
 */
export function useWindowSize(debounceMs: number = 150) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
  };
}

/**
 * Previous value hook
 * Tracks previous value of a variable
 * 
 * @param value - Value to track
 * @returns Previous value
 * 
 * @example
 * const prevCount = usePrevious(count);
 * console.log('Changed from', prevCount, 'to', count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Async operation hook with loading/error states
 * Manages async operations with proper state handling
 * 
 * @returns { execute, loading, error, data, reset }
 * 
 * @example
 * const { execute, loading, data, error } = useAsync();
 * 
 * const handleSubmit = async () => {
 *   await execute(apiCall());
 * };
 */
export function useAsync<T>() {
  const [state, setState] = useState<{
    loading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async (promise: Promise<T>) => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await promise;
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      setState({
        loading: false,
        error: error as Error,
        data: null,
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    execute,
    loading: state.loading,
    error: state.error,
    data: state.data,
    reset,
  };
}

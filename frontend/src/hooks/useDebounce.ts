import { useState, useEffect } from 'react';

/**
 * Debounce Hook
 * 
 * Delays updating a value until after a specified delay period
 * Useful for search inputs, API calls, and expensive computations
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // Perform search with debouncedSearch
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * 
 * <input
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   placeholder="Search..."
 * />
 * ```
 */

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function that clears the timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced Callback Hook
 * 
 * Returns a debounced version of a callback function
 * The callback will only be invoked after the specified delay
 * 
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback(
 *   (query: string) => {
 *     fetchResults(query);
 *   },
 *   500
 * );
 * 
 * <input
 *   onChange={(e) => handleSearch(e.target.value)}
 *   placeholder="Search..."
 * />
 * ```
 */

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * Throttle Hook
 * 
 * Limits how often a function can be called
 * Different from debounce: executes immediately and prevents subsequent calls
 * 
 * @example
 * ```tsx
 * const handleScroll = useThrottle(
 *   () => {
 *     console.log('Scrolled!');
 *   },
 *   1000
 * );
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [isThrottled, setIsThrottled] = useState(false);

  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      callback(...args);
      setIsThrottled(true);

      setTimeout(() => {
        setIsThrottled(false);
      }, delay);
    }
  };
}

/**
 * Debounced State Hook
 * 
 * Returns both immediate and debounced state values
 * Useful when you need to display immediate feedback but debounce actions
 * 
 * @example
 * ```tsx
 * const [search, debouncedSearch, setSearch] = useDebouncedState('', 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * 
 * <input
 *   value={search}  // Immediate update for UI
 *   onChange={(e) => setSearch(e.target.value)}
 * />
 * <p>Searching for: {debouncedSearch}</p>  // Debounced value
 * ```
 */

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, debouncedValue, setValue];
}

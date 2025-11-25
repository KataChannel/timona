'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  CSSProperties 
} from 'react';

export interface VirtualScrollItem {
  id: string;
  height?: number;
  data: any;
}

export interface VirtualScrollProps<T extends VirtualScrollItem> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  containerHeight: number;
  containerWidth?: string | number;
  overscan?: number;
  renderItem: (props: {
    item: T;
    index: number;
    style: CSSProperties;
  }) => React.ReactElement;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  className?: string;
  loadMoreItems?: (startIndex: number, stopIndex: number) => Promise<void>;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  threshold?: number;
}

export function VirtualScroll<T extends VirtualScrollItem>({
  items,
  itemHeight,
  containerHeight,
  containerWidth = '100%',
  overscan = 5,
  renderItem,
  onScroll,
  className = '',
  loadMoreItems,
  hasNextPage = false,
  isLoadingMore = false,
  threshold = 5,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate item heights and positions
  const itemPositions = useMemo(() => {
    const positions: { top: number; height: number }[] = [];
    let currentTop = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = typeof itemHeight === 'function' 
        ? itemHeight(items[i], i) 
        : itemHeight;
      
      positions.push({ top: currentTop, height });
      currentTop += height;
    }
    
    return positions;
  }, [items, itemHeight]);
  
  const totalHeight = itemPositions.length > 0 
    ? itemPositions[itemPositions.length - 1].top + itemPositions[itemPositions.length - 1].height
    : 0;
  
  // Binary search to find start index
  const findStartIndex = useCallback((scrollTop: number) => {
    let low = 0;
    let high = itemPositions.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const position = itemPositions[mid];
      
      if (position.top <= scrollTop && position.top + position.height > scrollTop) {
        return mid;
      } else if (position.top > scrollTop) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    
    return Math.max(0, Math.min(low, itemPositions.length - 1));
  }, [itemPositions]);
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (itemPositions.length === 0) {
      return { start: 0, end: 0 };
    }
    
    const startIndex = findStartIndex(scrollTop);
    let endIndex = startIndex;
    let accumulatedHeight = itemPositions[startIndex]?.height || 0;
    
    // Find end index by accumulating heights
    while (
      endIndex < itemPositions.length - 1 && 
      accumulatedHeight < containerHeight
    ) {
      endIndex++;
      accumulatedHeight += itemPositions[endIndex].height;
    }
    
    // Apply overscan
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(itemPositions.length - 1, endIndex + overscan);
    
    return { start, end };
  }, [scrollTop, containerHeight, overscan, itemPositions, findStartIndex]);
  
  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      position: itemPositions[visibleRange.start + index],
    }));
  }, [items, visibleRange, itemPositions]);
  
  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollLeft = e.currentTarget.scrollLeft;
    
    setScrollTop(scrollTop);
    setIsScrolling(true);
    
    onScroll?.(scrollTop, scrollLeft);
    
    // Check if we need to load more items
    if (
      hasNextPage && 
      !isLoadingMore && 
      loadMoreItems &&
      visibleRange.end >= items.length - threshold
    ) {
      loadMoreItems(items.length, items.length + 50);
    }
    
    // Reset scrolling state after inactivity
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onScroll, hasNextPage, isLoadingMore, loadMoreItems, visibleRange.end, items.length, threshold]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const currentScrollTop = container.scrollTop;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(visibleRange.end + 1, items.length - 1);
        const nextPosition = itemPositions[nextIndex];
        if (nextPosition) {
          container.scrollTop = nextPosition.top;
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(visibleRange.start - 1, 0);
        const prevPosition = itemPositions[prevIndex];
        if (prevPosition) {
          container.scrollTop = prevPosition.top;
        }
        break;
        
      case 'Home':
        e.preventDefault();
        container.scrollTop = 0;
        break;
        
      case 'End':
        e.preventDefault();
        container.scrollTop = totalHeight - containerHeight;
        break;
        
      case 'PageDown':
        e.preventDefault();
        container.scrollTop = Math.min(
          currentScrollTop + containerHeight * 0.8,
          totalHeight - containerHeight
        );
        break;
        
      case 'PageUp':
        e.preventDefault();
        container.scrollTop = Math.max(currentScrollTop - containerHeight * 0.8, 0);
        break;
    }
  }, [visibleRange, items.length, itemPositions, totalHeight, containerHeight]);
  
  // Scroll to specific item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current || !itemPositions[index]) return;
    
    const position = itemPositions[index];
    let scrollTop = position.top;
    
    switch (align) {
      case 'center':
        scrollTop = position.top - (containerHeight - position.height) / 2;
        break;
      case 'end':
        scrollTop = position.top - containerHeight + position.height;
        break;
    }
    
    containerRef.current.scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
  }, [itemPositions, containerHeight, totalHeight]);
  
  // Expose scroll methods
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);
  
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = totalHeight - containerHeight;
    }
  }, [totalHeight, containerHeight]);
  
  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center p-4 text-gray-500">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading more items...</span>
    </div>
  );
  
  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container overflow-auto ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth,
        position: 'relative',
      }}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-rowcount={items.length}
      aria-label="Virtual scrollable list"
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ item, index, position }) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: position.top,
              height: position.height,
              width: '100%',
              transform: isScrolling ? 'translateZ(0)' : undefined, // GPU acceleration while scrolling
            }}
            role="gridcell"
            aria-rowindex={index + 1}
          >
            {renderItem({
              item,
              index,
              style: {
                height: position.height,
                width: '100%',
              },
            })}
          </div>
        ))}
        
        {/* Loading indicator */}
        {hasNextPage && isLoadingMore && (
          <div
            style={{
              position: 'absolute',
              top: totalHeight,
              width: '100%',
            }}
          >
            <LoadingIndicator />
          </div>
        )}
      </div>
      
      {/* Scroll indicators */}
      {isScrolling && (
        <>
          {/* Scroll thumb */}
          <div
            className="absolute right-2 bg-gray-400 rounded-full opacity-75 transition-opacity"
            style={{
              top: `${(scrollTop / totalHeight) * containerHeight}px`,
              height: `${Math.max(20, (containerHeight / totalHeight) * containerHeight)}px`,
              width: '4px',
              zIndex: 1000,
            }}
          />
          
          {/* Scroll position indicator */}
          <div className="absolute top-2 right-8 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {Math.round((scrollTop / (totalHeight - containerHeight)) * 100)}%
          </div>
        </>
      )}
    </div>
  );
}

// Hook for virtual scroll with infinite loading
export function useVirtualScroll<T extends VirtualScrollItem>(
  initialItems: T[],
  fetchMore: (offset: number, limit: number) => Promise<T[]>,
  pageSize: number = 50
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    if (isLoadingMore || !hasNextPage) return;
    
    setIsLoadingMore(true);
    setError(null);
    
    try {
      const newItems = await fetchMore(items.length, pageSize);
      
      if (newItems.length === 0) {
        setHasNextPage(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setIsLoadingMore(false);
    }
  }, [items.length, pageSize, isLoadingMore, hasNextPage, fetchMore]);
  
  const reset = useCallback((newItems: T[]) => {
    setItems(newItems);
    setHasNextPage(true);
    setIsLoadingMore(false);
    setError(null);
  }, []);
  
  return {
    items,
    isLoadingMore,
    hasNextPage,
    error,
    loadMoreItems,
    reset,
  };
}
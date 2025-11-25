import { useEffect, useRef, useState, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';

/**
 * Mobile Drag & Drop Enhancement Hook
 * 
 * Improves drag & drop experience on mobile devices by:
 * - Adding touch event handlers
 * - Providing haptic feedback (vibration)
 * - Adjusting touch sensitivity
 * - Adding visual feedback for touch interactions
 * 
 * Usage:
 * const { isMobile, handleTouchStart, handleTouchEnd } = useMobileDragDrop();
 */

interface UseMobileDragDropOptions {
  /** Enable haptic feedback (vibration) */
  enableHaptics?: boolean;
  /** Touch sensitivity (ms) - how long to press before drag starts */
  touchDelay?: number;
  /** Enable scroll locking during drag */
  enableScrollLock?: boolean;
}

export const useMobileDragDrop = (options: UseMobileDragDropOptions = {}) => {
  const {
    enableHaptics = true,
    touchDelay = 200,
    enableScrollLock = true,
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const touchTimer = useRef<NodeJS.Timeout | null>(null);
  const draggedElement = useRef<HTMLElement | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Haptic feedback function
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics || !navigator.vibrate) return;

    const patterns = {
      light: 10,
      medium: 25,
      heavy: 50,
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  }, [enableHaptics]);

  // Lock scrolling during drag
  const lockScroll = useCallback(() => {
    if (!enableScrollLock) return;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }, [enableScrollLock]);

  // Unlock scrolling after drag
  const unlockScroll = useCallback(() => {
    if (!enableScrollLock) return;
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, [enableScrollLock]);

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent, element: HTMLElement) => {
    const touch = event.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    draggedElement.current = element;

    // Start timer for long press
    touchTimer.current = setTimeout(() => {
      setIsDragging(true);
      triggerHaptic('medium');
      lockScroll();

      // Add visual feedback
      if (element) {
        element.style.opacity = '0.5';
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'all 0.2s ease';
      }
    }, touchDelay);
  }, [touchDelay, triggerHaptic, lockScroll]);

  // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!isDragging || !touchStart) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Prevent default to stop scrolling
    if (deltaX > 10 || deltaY > 10) {
      event.preventDefault();
    }

    // Update dragged element position
    if (draggedElement.current) {
      const element = draggedElement.current;
      element.style.position = 'fixed';
      element.style.left = `${touch.clientX - 50}px`;
      element.style.top = `${touch.clientY - 50}px`;
      element.style.zIndex = '9999';
      element.style.pointerEvents = 'none';
    }
  }, [isDragging, touchStart]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    // Clear timer if touch ended before long press
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }

    // Reset dragged element styles
    if (draggedElement.current) {
      const element = draggedElement.current;
      element.style.opacity = '';
      element.style.transform = '';
      element.style.transition = '';
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      element.style.zIndex = '';
      element.style.pointerEvents = '';
    }

    if (isDragging) {
      triggerHaptic('light');
      unlockScroll();
    }

    setIsDragging(false);
    setTouchStart(null);
    draggedElement.current = null;
  }, [isDragging, triggerHaptic, unlockScroll]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  // Enhanced drag end handler with haptic feedback
  const enhancedDragEnd = useCallback((event: DragEndEvent, originalHandler: (event: DragEndEvent) => void) => {
    triggerHaptic('light');
    originalHandler(event);
  }, [triggerHaptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (touchTimer.current) {
        clearTimeout(touchTimer.current);
      }
      unlockScroll();
    };
  }, [unlockScroll]);

  return {
    isMobile,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    enhancedDragEnd,
    triggerHaptic,
  };
};

/**
 * Hook for optimized mobile scrolling during block editing
 * Prevents unwanted scroll behavior when editing blocks on mobile
 */
export const useMobileScrollOptimization = () => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // Prevent body scroll when editing
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isEditing]);

  return { isEditing, setIsEditing };
};

/**
 * Hook for responsive breakpoints in PageBuilder
 * Helps adjust UI based on device size
 */
export const useResponsivePageBuilder = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
};

export default useMobileDragDrop;

import { useState, useEffect, useCallback } from 'react';
import React from 'react';

/**
 * Custom hook for managing fullscreen mode in PageBuilder
 * 
 * Features:
 * - Toggle fullscreen mode
 * - High z-index when fullscreen is active
 * - Body scroll locking
 * - ESC key to exit fullscreen
 * - Position fixed for overlay effect
 * 
 * Usage:
 * const { isFullscreen, toggleFullscreen, fullscreenProps } = useFullscreen();
 * 
 * <div {...fullscreenProps}>
 *   <EditorToolbar isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
 * </div>
 */

interface FullscreenProps {
  className?: string;
  style?: React.CSSProperties;
}

export const useFullscreen = (initialFullscreen = false) => {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // Enter fullscreen
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen, exitFullscreen]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      // Store original body style
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      
      return () => {
        // Restore original style
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
      };
    }
  }, [isFullscreen]);

  // Props to apply to the fullscreen container
  const fullscreenProps: FullscreenProps = {
    className: isFullscreen ? 'fullscreen-active' : '',
    style: isFullscreen
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white',
          overflow: 'auto',
        }
      : {},
  };

  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
    enterFullscreen,
    fullscreenProps,
  };
};

/**
 * Higher-order component to add fullscreen capability
 * 
 * Usage:
 * const FullscreenPageBuilder = withFullscreen(PageBuilder);
 */
export const withFullscreen = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { isFullscreen, toggleFullscreen, fullscreenProps } = useFullscreen();

    return (
      <div {...fullscreenProps}>
        <Component {...props} />
      </div>
    );
  };
};

export default useFullscreen;

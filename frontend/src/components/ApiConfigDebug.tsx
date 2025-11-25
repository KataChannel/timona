'use client';

import { useEffect } from 'react';
import { logApiConfig } from '@/lib/api-config';

/**
 * Component để debug API configuration
 * Chỉ log trong development mode
 */
export function ApiConfigDebug() {
  useEffect(() => {
    // Log API config khi app load
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logApiConfig();
    }
  }, []);

  return null; // Component này không render gì
}

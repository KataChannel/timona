/**
 * useCartSession Hook
 * Optimized session management for cart operations
 * Handles both authenticated users and guest sessions
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionId, clearSessionId } from '@/lib/session';
import { useMutation } from '@apollo/client';
import { MERGE_CARTS } from '@/graphql/ecommerce.queries';

export function useCartSession() {
  const { isAuthenticated, user } = useAuth();
  // Initialize with getSessionId() immediately to avoid undefined
  const [sessionId, setSessionId] = useState<string>(() => getSessionId());
  const [isInitialized, setIsInitialized] = useState(false);

  const [mergeCarts] = useMutation(MERGE_CARTS, {
    onCompleted: (data) => {
      if (data.mergeCarts.success) {
        console.log('[CartSession] Carts merged successfully');
        clearSessionId();
        setSessionId(''); // Clear but don't set to undefined
      }
    },
    onError: (error) => {
      console.error('[CartSession] Error merging carts:', error);
    },
  });

  // Initialize session on mount
  useEffect(() => {
    if (!isInitialized) {
      // Re-get session ID to ensure consistency
      const id = getSessionId();
      setSessionId(id);
      setIsInitialized(true);
      console.log('[CartSession] Initialized with session ID:', id);
    }
  }, [isInitialized]);

  // Merge carts when user logs in
  useEffect(() => {
    // Only merge if:
    // 1. User is authenticated
    // 2. User object exists with ID
    // 3. Has a valid sessionId (guest cart exists)
    // 4. Session is initialized
    if (isAuthenticated && user?.id && sessionId && sessionId.trim() !== '' && isInitialized) {
      console.log('[CartSession] User logged in, merging carts...', {
        userId: user.id,
        sessionId,
        isAuthenticated,
        isInitialized,
      });
      
      // Don't pass userId in input - backend will get it from context
      // This avoids "User ID is required" error when context is not ready
      mergeCarts({
        variables: {
          input: {
            sessionId,
          },
        },
      }).then((result) => {
        if (result.data?.mergeCarts?.success) {
          console.log('[CartSession] Merge successful, clearing session');
        }
      }).catch((error) => {
        console.error('[CartSession] Merge failed:', error);
        // Don't clear sessionId on error - keep guest cart
      });
    }
  }, [isAuthenticated, user?.id, sessionId, isInitialized, mergeCarts]);

  // Get effective sessionId for cart operations
  // For authenticated users: don't send sessionId (backend will use userId from context)
  // For guest users: always ensure we have a valid sessionId
  const getEffectiveSessionId = useCallback(() => {
    if (isAuthenticated) {
      // Authenticated user - no sessionId needed
      return undefined;
    } else {
      // Guest user - MUST have a valid sessionId
      // If sessionId state is empty/undefined, get it immediately from localStorage
      const sid = sessionId && sessionId.trim() !== '' ? sessionId : getSessionId();
      return sid;
    }
  }, [isAuthenticated, sessionId]);

  const effectiveSessionId = getEffectiveSessionId();

  console.log('[CartSession] Returning:', { 
    effectiveSessionId, 
    isAuthenticated, 
    isInitialized,
    rawSessionId: sessionId 
  });

  return {
    sessionId: effectiveSessionId,
    isAuthenticated,
    isInitialized,
    getSessionId: getEffectiveSessionId, // Export function to get fresh sessionId
  };
}

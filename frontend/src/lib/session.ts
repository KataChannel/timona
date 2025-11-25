/**
 * Session management utilities for cart and anonymous users
 * Optimized for both client and server rendering
 */

const SESSION_ID_KEY = 'cart_session_id';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create a session ID for anonymous cart tracking
 * Always returns a valid session ID (creates if not exists)
 */
export function getSessionId(): string {
  // Server-side: generate temporary session ID (will be replaced on client)
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId || sessionId.trim() === '') {
      // Generate a new session ID
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      console.log('[Session] Created new session ID:', sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.error('[Session] LocalStorage error, using temporary session ID:', error);
    return generateSessionId();
  }
}

/**
 * Clear the session ID (e.g., when user logs in and cart is merged)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_ID_KEY);
      console.log('[Session] Cleared session ID');
    } catch (error) {
      console.error('[Session] Error clearing session ID:', error);
    }
  }
}

/**
 * Check if a valid session ID exists in localStorage
 */
export function hasSessionId(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    return !!sessionId && sessionId.trim() !== '';
  } catch (error) {
    console.error('[Session] Error checking session ID:', error);
    return false;
  }
}

/**
 * Initialize session on app startup (call in root layout/provider)
 */
export function initializeSession(): string {
  return getSessionId();
}

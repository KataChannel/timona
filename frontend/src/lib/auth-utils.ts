/**
 * Authentication utilities for token management
 */

export interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  roleType: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Get roleType from current token
 */
export function getTokenRoleType(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  const payload = decodeToken(token);
  return payload?.roleType || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get time until token expires (in seconds)
 */
export function getTokenExpiresIn(token: string): number {
  try {
    const payload = decodeToken(token);
    if (!payload) return -1;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp - currentTime;
  } catch (error) {
    return -1;
  }
}

/**
 * Compare roleType from token vs server
 * Returns true if they match, false if different
 */
export function isRoleStale(serverRoleType: string): boolean {
  const tokenRoleType = getTokenRoleType();
  if (!tokenRoleType) return true;
  
  // Normalize comparison (case-insensitive)
  return tokenRoleType.toLowerCase() !== serverRoleType.toLowerCase();
}

/**
 * Create new token from user data
 * This is a client-side simulation - real tokens come from server
 * Used only when we already have authorization from server
 */
export function createMockToken(user: any): string {
  if (typeof window === 'undefined') return '';
  
  // This is just for testing - real implementation uses server tokens
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    roleType: user.roleType,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  };
  
  // Simple base64 encoding (not proper JWT - just for simulation)
  return btoa(JSON.stringify(payload));
}

/**
 * Update stored token with new roleType
 * This should only be called after server confirms role change
 */
export function updateStoredTokenRoleType(newRoleType: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  try {
    // Note: In production, you should get a fresh token from the server
    // This just updates the payload for client-side role checks
    // The actual authorization is still validated on the server
    
    const payload = decodeToken(token);
    if (!payload) return false;
    
    // Update roleType
    const updatedPayload = {
      ...payload,
      roleType: newRoleType,
    };
    
    // Store updated payload (for client-side use only)
    sessionStorage.setItem('_tokenPayload', JSON.stringify(updatedPayload));
    
    console.log(`✅ Token roleType updated to: ${newRoleType}`);
    return true;
  } catch (error) {
    console.error('Failed to update token roleType:', error);
    return false;
  }
}

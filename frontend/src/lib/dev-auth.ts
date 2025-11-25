/**
 * Development authentication helper
 * Only use this for development/testing purposes
 */

export const setDevToken = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Create a simple development token
    // In a real app, you would get this from a proper login flow
    const devToken = 'dev-token-for-testing';
    localStorage.setItem('accessToken', devToken);
    console.log('🔧 Development token set for testing');
  }
};

export const clearDevToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    console.log('🔧 Token cleared');
  }
};

export const hasToken = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('accessToken');
  }
  return false;
};
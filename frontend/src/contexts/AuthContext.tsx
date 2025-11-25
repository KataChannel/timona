import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER, LOGIN_MUTATION, REGISTER_MUTATION } from '../lib/graphql/queries';
import { useRouter } from 'next/navigation';

interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions?: Permission[];
}

interface Permission {
  id: string;
  name: string;
  displayName: string;
  resource?: string;
  action?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  roleType?: string;
  roles?: Role[];
  permissions?: Permission[];
  createdAt?: string;
  // Profile information
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default context for SSR/initial render to prevent errors
    // This allows components to render without throwing during hydration
    if (typeof window === 'undefined') {
      // Server-side: return a fallback context
      return {
        user: null,
        login: async () => ({ success: false, error: 'Not available on server' }),
        register: async () => ({ success: false, error: 'Not available on server' }),
        logout: async () => {},
        loading: true,
        isAuthenticated: false,
      };
    }
    // Client-side: this should not happen if AuthProvider is properly set up
    console.warn('useAuth is being called outside of AuthProvider. This should not happen. Check your component tree.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [getCurrentUser, { data: currentUserData, error: currentUserError }] = useLazyQuery(GET_CURRENT_USER);
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Handle current user data updates
  useEffect(() => {
    if (currentUserData?.getMe) {
      console.log('%c✅ AuthContext - User authenticated successfully', 'color: #2ecc71; font-weight: bold;', currentUserData.getMe);
      setUser(currentUserData.getMe);
      setLoading(false);
    } else if (currentUserError) {
      const networkError = currentUserError.networkError as any;
      const graphQLErrors = currentUserError.graphQLErrors || [];
      
      // Log detailed error information
      console.group('%c❌ AuthContext - Error Handling', 'color: #e74c3c; font-weight: bold;');
      console.error('Full Error Object:', currentUserError);
      console.error('Network Error:', networkError);
      console.table(graphQLErrors.map(e => ({
        message: e.message,
        code: e.extensions?.code,
        path: e.path,
      })));
      
      // Check if it's a 401 Unauthorized error
      const is401Error = networkError?.statusCode === 401 || networkError?.status === 401;
      if (is401Error) {
        console.log('%c🔐 401 HTTP Status Code detected - LOGOUT REQUIRED', 'color: #e74c3c; font-weight: bold;');
      }
      
      // Check if it's an explicit auth-related GraphQL error
      // ONLY check error codes, NOT message strings (messages are too unpredictable)
      const isExplicitAuthError = graphQLErrors.some(err => {
        const isUnauthenticated = err.extensions?.code === 'UNAUTHENTICATED';
        const isForbidden = err.extensions?.code === 'FORBIDDEN';
        
        if (isUnauthenticated) console.log('%c🔑 UNAUTHENTICATED error code detected', 'color: #f39c12;');
        if (isForbidden) console.log('%c🚫 FORBIDDEN error code detected', 'color: #f39c12;');
        
        return isUnauthenticated || isForbidden;
      });
      
      if (isExplicitAuthError) {
        console.log('%c🚨 Explicit auth-related GraphQL error detected - LOGOUT REQUIRED', 'color: #e74c3c; font-weight: bold;');
      }
      
      // Only logout on explicit auth errors, NOT on transient network issues
      const isAuthError = is401Error || isExplicitAuthError;

      if (isAuthError) {
        console.log('%c🔓 LOGGING OUT - Clearing all auth data', 'color: #c0392b; font-weight: bold;');
        console.table({
          'Current Token': localStorage.getItem('accessToken') ? 'EXISTS' : 'NONE',
          'Action': 'REMOVING',
          'Timestamp': new Date().toISOString()
        });
        
        // Clear ALL auth-related data at once to prevent confusion
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.log('%c✓ Auth data cleared from localStorage', 'color: #27ae60;');
        
        setUser(null);
      } else {
        console.log('%c⚠️  Transient network error detected - KEEPING TOKEN for retry', 'color: #f39c12; font-weight: bold;');
        console.log('Error details:', {
          type: networkError?.name || 'Unknown',
          message: networkError?.message,
          statusCode: networkError?.statusCode,
          willRetry: true
        });
        // For network errors, timeouts, or other transient issues, keep the token
        // User will retry on next interaction
        // Don't set user to null, just stop loading
      }
      console.groupEnd();
      setLoading(false);
    }
  }, [currentUserData, currentUserError]);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [getCurrentUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
    try {
      console.log('%c🔐 Login attempt started', 'color: #3498db; font-weight: bold;', { email, timestamp: new Date().toISOString() });
      const { data } = await loginMutation({
        variables: { 
          input: {
            emailOrUsername: email,
            password: password
          }
        },
      });

      if (data?.loginUser?.accessToken) {
        const token = data.loginUser.accessToken;
        const redirectUrl = data.loginUser.redirectUrl;
        localStorage.setItem('accessToken', token);
        
        // Also notify apollo client of the token change
        // This ensures apollo-client can use the new token immediately
        if (typeof window !== 'undefined') {
          // Dispatch a storage event to notify other parts of the app
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'accessToken',
            newValue: token,
            storageArea: localStorage,
          }));
        }
        
        // Refresh user data
        getCurrentUser();
        return { success: true, redirectUrl };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
    try {
      const { data } = await registerMutation({
        variables: { 
          input: {
            email: email,
            password: password,
            username: username
          }
        },
      });

      if (data?.registerUser?.accessToken) {
        const token = data.registerUser.accessToken;
        const redirectUrl = data.registerUser.redirectUrl;
        localStorage.setItem('accessToken', token);
        
        // Also notify apollo client of the token change
        if (typeof window !== 'undefined') {
          // Dispatch a storage event to notify other parts of the app
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'accessToken',
            newValue: token,
            storageArea: localStorage,
          }));
        }
        
        // Refresh user data
        getCurrentUser();
        return { success: true, redirectUrl };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    // Clear ALL auth-related data at once to ensure clean state
    console.log('%c🚪 Manual logout triggered', 'color: #e74c3c; font-weight: bold;', { timestamp: new Date().toISOString() });
    console.table({
      'Token Before': localStorage.getItem('accessToken') ? 'EXISTS' : 'NONE',
      'Action': 'REMOVING',
      'User': user?.email || 'NONE'
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('%c✓ All auth data cleared', 'color: #27ae60;');
    setUser(null);

    // Fetch logout redirect URL from settings
    try {
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:13001/graphql';
      
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetLogoutRedirect {
              publicWebsiteSettings(keys: ["auth_logout_redirect"]) {
                key
                value
              }
            }
          `,
        }),
        cache: 'no-store',
      });

      const { data } = await response.json();
      const settings = data?.publicWebsiteSettings || [];
      const logoutSetting = settings.find((s: any) => s.key === 'auth_logout_redirect');
      const logoutUrl = logoutSetting?.value?.trim() || '/';

      console.log(`%c🔀 Redirecting after logout to: ${logoutUrl}`, 'color: #3498db; font-weight: bold;');
      
      // Use window.location for hard navigation (clears all React state)
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('[Logout] Error fetching redirect setting:', error);
      // Fallback to root if error
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

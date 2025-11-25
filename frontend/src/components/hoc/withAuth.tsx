import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Authentication State
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

/**
 * Authentication Check Function
 * 
 * This should be implemented based on your auth system
 * Example implementations:
 * - Check localStorage/cookies for token
 * - Verify with backend API
 * - Use auth context/provider
 */
export type AuthCheckFn = () => Promise<AuthState> | AuthState;

/**
 * Higher-Order Component: withAuth
 * 
 * Protects components from unauthorized access
 * Redirects to login page if user is not authenticated
 * 
 * @example
 * ```tsx
 * // Simple usage with default settings
 * const ProtectedPage = withAuth(DashboardPage);
 * 
 * // With custom options
 * const ProtectedPage = withAuth(DashboardPage, {
 *   redirectTo: '/auth/login',
 *   checkAuth: async () => {
 *     const token = localStorage.getItem('token');
 *     if (!token) return { isAuthenticated: false, isLoading: false, user: null };
 *     
 *     const user = await verifyToken(token);
 *     return { isAuthenticated: true, isLoading: false, user };
 *   },
 *   LoadingComponent: () => <Spinner />,
 *   requireRoles: ['admin', 'editor'],
 * });
 * ```
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    checkAuth?: AuthCheckFn;
    LoadingComponent?: React.ComponentType;
    UnauthorizedComponent?: React.ComponentType;
    requireRoles?: string[];
    checkRole?: (user: any, roles: string[]) => boolean;
  } = {}
) {
  const {
    redirectTo = '/login',
    checkAuth,
    LoadingComponent,
    UnauthorizedComponent,
    requireRoles,
    checkRole,
  } = options;

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithAuth = (props: P) => {
    const router = useRouter();
    const [authState, setAuthState] = React.useState<AuthState>({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    useEffect(() => {
      const verifyAuth = async () => {
        try {
          // Use custom auth check if provided
          if (checkAuth) {
            const result = await Promise.resolve(checkAuth());
            setAuthState(result);
            return;
          }

          // Default auth check using localStorage
          const token = typeof window !== 'undefined' 
            ? localStorage.getItem('token') 
            : null;

          if (!token) {
            setAuthState({ isAuthenticated: false, isLoading: false, user: null });
            return;
          }

          // In a real app, verify token with backend
          // For now, just check if token exists
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: { token }, // You should decode/verify token to get user data
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          setAuthState({ isAuthenticated: false, isLoading: false, user: null });
        }
      };

      verifyAuth();
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
      if (!authState.isLoading && !authState.isAuthenticated) {
        router.push(redirectTo);
      }
    }, [authState.isLoading, authState.isAuthenticated, router]);

    // Check role requirements
    const hasRequiredRole = React.useMemo(() => {
      if (!requireRoles || requireRoles.length === 0) return true;
      if (!authState.user) return false;

      if (checkRole) {
        return checkRole(authState.user, requireRoles);
      }

      // Default role check (assumes user has a 'role' or 'roles' property)
      const userRoles = authState.user.roles || [authState.user.role];
      return requireRoles.some(role => userRoles.includes(role));
    }, [authState.user]);

    // Show loading state
    if (authState.isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Show unauthorized state if role check fails
    if (authState.isAuthenticated && !hasRequiredRole) {
      if (UnauthorizedComponent) {
        return <UnauthorizedComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Unauthorized
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    // Render component if authenticated and authorized
    if (authState.isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    // Redirecting (show nothing or loading)
    return null;
  };

  WithAuth.displayName = `withAuth(${displayName})`;

  return WithAuth;
}

/**
 * useAuth Hook
 * 
 * Access auth state in functional components
 * Must be used inside a component wrapped with withAuth or AuthProvider
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { user, isAuthenticated, logout } = useAuth();
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user.name}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useAuth() {
  const [user, setUser] = React.useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') 
      : null;

    if (token) {
      setUser({ token });
      setIsAuthenticated(true);
    }
  }, []);

  const login = React.useCallback(async (credentials: any) => {
    // Implement your login logic
    // This is a placeholder
    localStorage.setItem('token', 'dummy-token');
    setUser({ ...credentials });
    setIsAuthenticated(true);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}

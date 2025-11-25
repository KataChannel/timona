/**
 * Higher-Order Components (HOCs)
 * 
 * Reusable component wrappers for cross-cutting concerns:
 * - Error handling and boundaries
 * - Authentication and authorization
 * - Loading and empty states
 */

// Error Boundary HOC
export { 
  withErrorBoundary, 
  ErrorBoundary, 
  useErrorHandler 
} from './withErrorBoundary';

// Authentication HOC
export { 
  withAuth, 
  useAuth 
} from './withAuth';
export type { AuthState, AuthCheckFn } from './withAuth';

// Loading State HOC
export { 
  withLoading,
  DefaultLoadingComponent,
  DefaultErrorComponent,
  DefaultEmptyComponent,
  SkeletonLoading
} from './withLoading';

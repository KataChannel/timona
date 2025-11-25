import React from 'react';

/**
 * Loading State Props
 */
interface LoadingState {
  isLoading: boolean;
  error?: Error | null;
  data?: any;
}

/**
 * Higher-Order Component: withLoading
 * 
 * Wraps a component with loading and error states
 * Shows loading indicator while data is being fetched
 * Shows error message if fetch fails
 * 
 * @example
 * ```tsx
 * const UserList = ({ users }) => (
 *   <ul>
 *     {users.map(user => <li key={user.id}>{user.name}</li>)}
 *   </ul>
 * );
 * 
 * const UserListWithLoading = withLoading(UserList, {
 *   LoadingComponent: () => <Spinner />,
 *   ErrorComponent: ({ error, retry }) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </div>
 *   ),
 *   EmptyComponent: () => <p>No users found</p>,
 *   checkEmpty: (props) => !props.users || props.users.length === 0,
 * });
 * 
 * // Usage
 * <UserListWithLoading 
 *   users={users} 
 *   isLoading={loading} 
 *   error={error}
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    LoadingComponent?: React.ComponentType<{ message?: string }>;
    ErrorComponent?: React.ComponentType<{ error: Error; retry?: () => void }>;
    EmptyComponent?: React.ComponentType;
    checkEmpty?: (props: P) => boolean;
  } = {}
) {
  const {
    LoadingComponent,
    ErrorComponent,
    EmptyComponent,
    checkEmpty,
  } = options;

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithLoading = (props: P & { 
    isLoading?: boolean; 
    error?: Error | null;
    onRetry?: () => void;
    loadingMessage?: string;
  }) => {
    const { isLoading, error, onRetry, loadingMessage, ...rest } = props;

    // Show loading state
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent message={loadingMessage} />;
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            {loadingMessage && (
              <p className="mt-4 text-sm text-gray-600">{loadingMessage}</p>
            )}
          </div>
        </div>
      );
    }

    // Show error state
    if (error) {
      if (ErrorComponent) {
        return <ErrorComponent error={error} retry={onRetry} />;
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              Error Loading Data
            </h2>

            <p className="mt-2 text-sm text-gray-600 text-center">
              {error.message || 'An unexpected error occurred'}
            </p>

            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    // Check if data is empty
    if (checkEmpty && EmptyComponent && checkEmpty(rest as P)) {
      return <EmptyComponent />;
    }

    // Render wrapped component with data
    return <WrappedComponent {...(rest as P)} />;
  };

  WithLoading.displayName = `withLoading(${displayName})`;

  return WithLoading;
}

/**
 * Default Loading Component
 * 
 * Simple spinner with optional message
 */
export const DefaultLoadingComponent: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  </div>
);

/**
 * Default Error Component
 * 
 * Error message with retry button
 */
export const DefaultErrorComponent: React.FC<{ 
  error: Error; 
  retry?: () => void;
}> = ({ error, retry }) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
        Something went wrong
      </h3>

      <p className="mt-2 text-sm text-gray-600 text-center">
        {error.message}
      </p>

      {retry && (
        <button
          onClick={retry}
          className="mt-6 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  </div>
);

/**
 * Default Empty Component
 * 
 * Shows when no data is available
 */
export const DefaultEmptyComponent: React.FC<{ message?: string }> = ({ 
  message = 'No data available' 
}) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <div className="text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Skeleton Loading Component
 * 
 * Shows skeleton placeholders while loading
 */
export const SkeletonLoading: React.FC<{ 
  rows?: number;
  columns?: number;
}> = ({ rows = 3, columns = 1 }) => (
  <div className="space-y-4 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
        ))}
      </div>
    ))}
  </div>
);

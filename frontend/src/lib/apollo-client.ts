import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
// @ts-ignore - apollo-upload-client doesn't have proper TypeScript definitions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

// Utility function to safely stringify objects for logging
const safeStringify = (obj: any, maxDepth = 3): string => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    return `[Unable to stringify: ${error}]`;
  }
};

// Check if we're in development mode for detailed logging
const isDevelopment = process.env.NODE_ENV === 'development';

// Enhanced logging function
const logError = (level: 'error' | 'warn' | 'info', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] Apollo Client`;
  
  if (level === 'error') {
    console.error(`${prefix} ❌`, message, data ? safeStringify(data) : '');
  } else if (level === 'warn') {
    console.warn(`${prefix} ⚠️`, message, data ? safeStringify(data) : '');
  } else {
    console.info(`${prefix} ℹ️`, message, data ? safeStringify(data) : '');
  }
};

// Error context collector for debugging
const collectErrorContext = () => {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt
    } : null,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    language: navigator.language,
    platform: navigator.platform
  };
};

// HTTP Link
const getGraphQLUri = () => {
  let endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:14000/graphql';
  
  // In browser environment, if page is loaded via HTTPS but endpoint is HTTP, fix it
  if (typeof window !== 'undefined') {
    // If current page is HTTPS but endpoint is HTTP, upgrade to HTTPS
    if (window.location.protocol === 'https:' && endpoint.startsWith('http://')) {
      // Replace http:// with https://
      endpoint = endpoint.replace('http://', 'https://');
      console.info(`[Apollo] Upgraded GraphQL endpoint to HTTPS: ${endpoint}`);
    }
    // If current page is HTTP and endpoint is HTTPS, downgrade to HTTP
    else if (window.location.protocol === 'http:' && endpoint.startsWith('https://')) {
      endpoint = endpoint.replace('https://', 'http://');
      console.info(`[Apollo] Downgraded GraphQL endpoint to HTTP: ${endpoint}`);
    }
  }
  
  return endpoint;
};

const httpLink = createUploadLink({
  uri: getGraphQLUri(),
  // Increase timeout for AI operations (analysis and generation can take 30-60s)
  fetchOptions: {
    timeout: 120000, // 120 seconds (2 minutes)
  },
});

// WebSocket Link for subscriptions - completely disabled in development
const wsLink = null; // Temporarily disabled due to connection issues

// Auth Link - adds authorization header with token caching and debugging
let cachedToken: string | null = null;
const authLink = setContext((_, { headers }) => {
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    // First check localStorage
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      token = storedToken;
      cachedToken = storedToken;
    }
    // Fall back to cached token (for cases where localStorage isn't synced)
    else if (cachedToken) {
      token = cachedToken;
    }
  }
  
  if (process.env.NODE_ENV === 'development' && !token) {
    console.warn('[AuthLink] No token found in localStorage or cache');
  }
  
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
      // Add CSRF protection header required by Apollo Server
      'apollo-require-preflight': 'true',
    },
  };
});

// Error Link - handles GraphQL and network errors
// IMPORTANT: This link should NOT redirect users or clear tokens!
// The AuthContext is responsible for managing auth state.
// Apollo should only log errors and let the application handle the response.
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors && graphQLErrors.length > 0) {
    console.group('%c🚨 GraphQL Errors Detected', 'color: #e74c3c; font-weight: bold;');
    console.log(`Operation: ${operation.operationName}`);
    console.table(graphQLErrors.map((err, idx) => ({
      '#': idx + 1,
      'Message': err.message,
      'Code': err.extensions?.code || 'N/A',
      'Path': err.path?.join('.') || 'N/A',
    })));
    const errorDetails = graphQLErrors.map(({ message, locations, path, extensions }) => {
      const errorInfo = {
        message,
        path,
        locations,
        extensions,
        operation: operation.operationName,
        variables: operation.variables,
        timestamp: new Date().toISOString()
      };

      // Handle specific GraphQL errors with logging only
      if (message === 'Bad Request Exception') {
        logError('warn', '🚨 Bad request - check query syntax and variables', { message, path });
      }
      
      // Log authentication errors but don't redirect here
      // AuthContext will handle token removal based on error type (only UNAUTHENTICATED code)
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.log('%c🔐 UNAUTHENTICATED error - delegating to AuthContext', 'color: #f39c12;');
        logError('warn', '🔐 UNAUTHENTICATED error - AuthContext will handle logout', { message, path });
        // Don't redirect or clear tokens here - let AuthContext handle it
        return errorInfo;
      }
      
      if (message === 'Forbidden resource' || (extensions?.code === 'FORBIDDEN')) {
        console.log('%c🚫 Forbidden error - delegating to AuthContext', 'color: #f39c12;');
        logError('warn', '🔐 Forbidden error - let AuthContext decide if logout is needed', { message, path });
        // Let AuthContext handle this, don't auto-logout from Apollo
      }
      
      // Handle validation errors
      if (message.includes('validation') || message.includes('invalid')) {
        logError('warn', '📝 Validation error - check input data', { message, path });
      }

      // Handle resource not found errors
      if (message.includes('not found')) {
        logError('warn', '🔍 Resource not found - check if resource exists', { 
          message, 
          path,
          operation: operation.operationName,
          variables: operation.variables
        });
      }

      return errorInfo;
    });

    // Log based on environment
    if (isDevelopment) {
      // Detailed logging in development
      console.log('%cℹ️ Full error details:', 'color: #3498db;', errorDetails);
    } else {
      // Production logging - summarized
      const errorSummary = graphQLErrors.map((err: any) => ({
        message: err.message,
        code: err.extensions?.code,
        path: err.path
      }));
      logError('warn', 'GraphQL errors occurred', { 
        errors: errorSummary,
        context: collectErrorContext()
      });
    }
    console.groupEnd();
  }

  if (networkError) {
    // Create detailed error information
    const errorInfo = {
      type: networkError.name || 'NetworkError',
      message: networkError.message,
      operation: operation.operationName,
      variables: operation.variables,
      timestamp: new Date().toISOString()
    };

    // Add additional properties if available
    if ('statusCode' in networkError) {
      (errorInfo as any).statusCode = networkError.statusCode;
    }
    if ('result' in networkError && networkError.result) {
      (errorInfo as any).result = networkError.result;
    }
    if ('response' in networkError && networkError.response) {
      (errorInfo as any).response = networkError.response;
    }
    if ('request' in networkError && networkError.request) {
      const request = networkError.request as any;
      (errorInfo as any).requestUrl = request?.url || 'N/A';
      (errorInfo as any).requestMethod = request?.method || 'N/A';
    }

    // Log based on environment
    if (isDevelopment) {
      console.group('🚨 [Network Error Details]');
      console.error('Error Info:', errorInfo);
      console.error('Context:', collectErrorContext());
      console.log(`⏱️ Error Type: ${errorInfo.type}`);
      console.log(`📡 Operation: ${errorInfo.operation}`);
      console.groupEnd();
    } else {
      // Production logging - less verbose but include context
      logError('error', 'Network error occurred', {
        ...errorInfo,
        context: collectErrorContext()
      });
    }
    
    // Handle WebSocket errors gracefully
    if (networkError.message?.includes('Socket closed') || 
        networkError.message?.includes('WebSocket')) {
      console.warn('🔌 WebSocket connection lost - will attempt to reconnect');
      // Don't redirect on WebSocket errors
      return;
    }
    
    // IMPORTANT: Only redirect for explicit 401 errors
    // Transient network errors should not cause logout
    // That way, if there's a temporary network hiccup during page reload,
    // the user won't get logged out
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      console.log('%c🚨 HTTP 401 Unauthorized - LOGGING OUT', 'color: #c0392b; font-weight: bold;');
      logError('warn', '🔐 Unauthorized access (401) - redirecting to login');
      if (typeof window !== 'undefined') {
        // Clear ALL auth-related data at once
        console.log('%c🔓 Clearing auth data from Apollo error link', 'color: #c0392b;');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.log('%c↪️ Redirecting to /login', 'color: #c0392b;');
        window.location.href = '/login';
      }
    }
    
    // Handle other common network errors with logging only
    if ('statusCode' in networkError) {
      const statusCode = networkError.statusCode;
      switch (statusCode) {
        case 403:
          console.log(`%c🚫 Forbidden (403) - insufficient permissions`, 'color: #e67e22;');
          logError('warn', '🚫 Forbidden (403) - insufficient permissions');
          break;
        case 404:
          console.log(`%c❓ Not Found (404) - resource not found`, 'color: #e67e22;');
          logError('warn', '❓ Not Found (404) - resource not found');
          break;
        case 500:
          console.log(`%c💥 Internal Server Error (500)`, 'color: #e74c3c;');
          logError('error', '💥 Internal Server Error (500)');
          break;
        case 502:
          console.log(`%c🔧 Bad Gateway (502) - server might be down`, 'color: #e74c3c;');
          logError('error', '🔧 Bad Gateway (502) - server might be down');
          break;
        case 503:
          console.log(`%c⏰ Service Unavailable (503) - please try again later`, 'color: #e74c3c;');
          logError('error', '⏰ Service Unavailable (503) - please try again later');
          break;
        default:
          // For other status codes, just log - don't auto-logout
          console.log(`%c⚠️ HTTP Error ${statusCode}`, 'color: #e67e22;');
          logError('warn', `⚠️ HTTP Error ${statusCode}`);
      }
    }
  }
});

// Split based on operation type - only if WebSocket is available
const splitLink = wsLink 
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink); // Fallback to HTTP only

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getPosts: {
            keyArgs: ['filters'],
            merge(existing, incoming, { args }) {
              if (args?.pagination?.page === 1) {
                // First page - replace existing
                return incoming;
              }
              // Subsequent pages - merge items
              return {
                ...incoming,
                items: [...(existing?.items || []), ...(incoming?.items || [])],
              };
            },
          },
          posts: {
            merge(existing, incoming, { args }) {
              // Simple replacement strategy
              return incoming;
            },
          },
          getPostById: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          getTask: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
      // Default timeout for queries (AI operations may override this)
      context: {
        fetchOptions: {
          timeout: 120000, // 2 minutes for AI operations
        },
      },
    },
    mutate: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
      context: {
        fetchOptions: {
          timeout: 120000, // 2 minutes for AI operations
        },
      },
    },
  },
});

// Schema version tracking to auto-clear cache on breaking changes
const SCHEMA_VERSION = '2.0.1'; // Increment this when GraphQL schema has breaking changes
const SCHEMA_VERSION_KEY = 'apollo_schema_version';

if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY);
  if (storedVersion !== SCHEMA_VERSION) {
    console.log(`[Apollo] Schema version changed: ${storedVersion} → ${SCHEMA_VERSION}`);
    console.log('[Apollo] Clearing cache...');
    apolloClient.clearStore().then(() => {
      localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
      console.log('[Apollo] Cache cleared successfully');
    }).catch(err => {
      console.error('[Apollo] Failed to clear cache:', err);
    });
  }
}

// Helper function to manually clear Apollo cache
export const clearApolloCache = async () => {
  try {
    await apolloClient.clearStore();
    console.log('[Apollo] Cache cleared manually');
    return true;
  } catch (error) {
    console.error('[Apollo] Failed to clear cache:', error);
    return false;
  }
};

export default apolloClient;

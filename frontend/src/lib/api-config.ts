/**
 * API Configuration Helper
 * Provides consistent API base URL across the application
 * Priority: NEXT_PUBLIC_BACKEND_URL > NEXT_PUBLIC_GRAPHQL_ENDPOINT > fallback
 */

/**
 * Get the backend base URL
 * Priority order ensures correct URL for each environment
 */
export const getApiBaseUrl = (): string => {
  // Priority 1: NEXT_PUBLIC_BACKEND_URL (used in rausach, tazagroup)
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // Priority 2: NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Priority 3: Extract from NEXT_PUBLIC_GRAPHQL_ENDPOINT
  if (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT) {
    return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT.replace('/graphql', '');
  }

  // Fallback for development
  return 'http://localhost:12001';
};

/**
 * Get the GraphQL endpoint URL
 */
export const getGraphqlEndpoint = (): string => {
  // Priority 1: NEXT_PUBLIC_GRAPHQL_ENDPOINT
  if (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT) {
    return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  }

  // Priority 2: Build from NEXT_PUBLIC_BACKEND_URL
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`;
  }

  // Priority 3: NEXT_PUBLIC_GRAPHQL_URL (alternative name)
  if (process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    return process.env.NEXT_PUBLIC_GRAPHQL_URL;
  }

  // Fallback for development
  return 'http://localhost:12001/graphql';
};

/**
 * Get authentication token from localStorage
 * Uses 'accessToken' key to sync with Apollo Client
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

/**
 * Create authorization header object
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make authenticated fetch request to backend API
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
  
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Get file upload endpoint URL
 */
export const getFileUploadUrl = (): string => {
  return `${getApiBaseUrl()}/api/files/upload`;
};

/**
 * Get bulk file upload endpoint URL
 */
export const getBulkFileUploadUrl = (): string => {
  return `${getApiBaseUrl()}/api/files/upload/bulk`;
};

/**
 * Debug: Log current API configuration
 */
export const logApiConfig = () => {
  if (typeof window !== 'undefined') {
    console.group('🔧 API Configuration');
    console.log('Base URL:', getApiBaseUrl());
    console.log('GraphQL URL:', getGraphqlEndpoint());
    console.log('File Upload:', getFileUploadUrl());
    console.log('Bulk Upload:', getBulkFileUploadUrl());
    console.log('Environment Variables:');
    console.log('  NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('  NEXT_PUBLIC_GRAPHQL_ENDPOINT:', process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT);
    console.groupEnd();
  }
};

/**
 * Configuration object for easy import
 */
export const apiConfig = {
  getBaseUrl: getApiBaseUrl,
  getGraphqlEndpoint: getGraphqlEndpoint,
  getFileUploadUrl: getFileUploadUrl,
  getBulkFileUploadUrl: getBulkFileUploadUrl,
  getAuthToken: getAuthToken,
  getAuthHeaders: getAuthHeaders,
  fetch: apiFetch,
  logConfig: logApiConfig,
};

export default apiConfig;

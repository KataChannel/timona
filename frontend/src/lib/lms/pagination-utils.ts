/**
 * LMS GraphQL Utilities
 * Pagination helpers và caching strategies
 */

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// ================================
// Pagination Types
// ================================

export interface PaginationInput {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// ================================
// Cache Policies
// ================================

export const LMS_CACHE_CONFIG = {
  typePolicies: {
    Query: {
      fields: {
        // Courses - Cache with pagination
        courses: {
          keyArgs: ['filter', 'orderBy'],
          merge(existing: any, incoming: any, { args }: any) {
            const merged = existing ? { ...existing } : { items: [], pagination: {} };
            
            if (args?.pagination?.page === 1) {
              // Reset cache for first page
              return incoming;
            }
            
            // Merge pages for infinite scroll
            return {
              ...incoming,
              items: [...(existing?.items || []), ...(incoming?.items || [])],
            };
          },
        },
        
        // Enrollments - Cache with network
        enrollments: {
          keyArgs: ['filter'],
          merge(existing: any, incoming: any) {
            return incoming; // Always use latest data
          },
        },
        
        // Students - Cache first
        students: {
          keyArgs: ['filter'],
        },
      },
    },
    
    Course: {
      fields: {
        // Cache course modules
        modules: {
          merge(existing: any, incoming: any) {
            return incoming;
          },
        },
      },
    },
  },
};

// ================================
// Pagination Query Helpers
// ================================

/**
 * Build pagination variables for GraphQL query
 */
export function buildPaginationVars(page: number, limit: number): PaginationInput {
  return {
    page,
    limit,
  };
}

/**
 * Calculate total pages from total items
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Extract pagination info from response
 */
export function extractPaginationInfo(
  response: any,
  currentPage: number,
  pageSize: number
): PaginationInfo {
  const totalItems = response?.total || response?.totalCount || 0;
  const totalPages = calculateTotalPages(totalItems, pageSize);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

// ================================
// Cache Invalidation Helpers
// ================================

/**
 * Invalidate course list cache after mutations
 */
export function invalidateCoursesCache(client: ApolloClient<any>) {
  client.cache.evict({ fieldName: 'courses' });
  client.cache.gc();
}

/**
 * Invalidate enrollment cache
 */
export function invalidateEnrollmentsCache(client: ApolloClient<any>) {
  client.cache.evict({ fieldName: 'enrollments' });
  client.cache.evict({ fieldName: 'myEnrollments' });
  client.cache.gc();
}

/**
 * Invalidate specific course cache
 */
export function invalidateCourseCache(client: ApolloClient<any>, courseId: string) {
  client.cache.evict({ id: `Course:${courseId}` });
  client.cache.gc();
}

/**
 * Refetch queries after mutation
 */
export function refetchAfterMutation(queryNames: string[]) {
  return {
    refetchQueries: queryNames,
    awaitRefetchQueries: true,
  };
}

// ================================
// Optimistic Updates
// ================================

/**
 * Optimistic update for course publish
 */
export function optimisticUpdateCourseStatus(
  courseId: string,
  newStatus: string
) {
  return {
    __typename: 'Course',
    id: courseId,
    status: newStatus,
  };
}

/**
 * Optimistic update for enrollment
 */
export function optimisticCreateEnrollment(
  userId: string,
  courseId: string
) {
  return {
    __typename: 'Enrollment',
    id: 'temp-' + Date.now(),
    userId,
    courseId,
    status: 'ACTIVE',
    progress: 0,
    enrolledAt: new Date().toISOString(),
  };
}

// ================================
// Fetch Policies
// ================================

export const FETCH_POLICIES = {
  // Always fetch from network, update cache
  NETWORK_ONLY: 'network-only' as const,
  
  // Fetch from cache first, then network
  CACHE_FIRST: 'cache-first' as const,
  
  // Fetch from cache, update from network in background
  CACHE_AND_NETWORK: 'cache-and-network' as const,
  
  // Only use cache, never network
  CACHE_ONLY: 'cache-only' as const,
  
  // Always fetch from network, don't update cache
  NO_CACHE: 'no-cache' as const,
};

// ================================
// Query Options Templates
// ================================

/**
 * Options for list queries with pagination
 */
export function getListQueryOptions(page: number, limit: number) {
  return {
    variables: {
      pagination: buildPaginationVars(page, limit),
    },
    fetchPolicy: FETCH_POLICIES.CACHE_AND_NETWORK,
    notifyOnNetworkStatusChange: true,
  };
}

/**
 * Options for detail queries (single item)
 */
export function getDetailQueryOptions() {
  return {
    fetchPolicy: FETCH_POLICIES.CACHE_FIRST,
  };
}

/**
 * Options for real-time data (always fresh)
 */
export function getRealtimeQueryOptions() {
  return {
    fetchPolicy: FETCH_POLICIES.NETWORK_ONLY,
    pollInterval: 30000, // Refresh every 30s
  };
}

// ================================
// Loading State Helpers
// ================================

/**
 * Check if query is in loading state
 */
export function isQueryLoading(networkStatus: number): boolean {
  // 1 = loading, 2 = setVariables, 3 = fetchMore, 4 = refetch
  return [1, 2, 3, 4].includes(networkStatus);
}

/**
 * Check if query is refetching
 */
export function isQueryRefetching(networkStatus: number): boolean {
  return networkStatus === 4;
}

/**
 * Check if query is fetching more (pagination)
 */
export function isQueryFetchingMore(networkStatus: number): boolean {
  return networkStatus === 3;
}

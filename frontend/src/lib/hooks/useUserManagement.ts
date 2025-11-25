import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  GET_USER_STATS,
  GET_USER_BY_ID,
  GET_ALL_USERS,
  ADMIN_UPDATE_USER,
  ADMIN_CREATE_USER,
  BULK_USER_ACTION,
  DELETE_USER,
  UPDATE_USER,
} from '../graphql/user-queries';
import { 
  useDynamicFindMany, 
  useDynamicCount 
} from '../graphql/universal-dynamic-hooks';
import { useMemo } from 'react';

// Types
interface UserSearchInput {
  search?: string;
  roleType?: 'ADMIN' | 'USER' | 'GUEST';
  isActive?: boolean;
  isVerified?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface BulkUserActionInput {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'verify' | 'changeRole';
  newRole?: 'ADMIN' | 'USER' | 'GUEST';
}

interface AdminUpdateUserInput {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleType?: 'ADMIN' | 'USER' | 'GUEST';
  isActive?: boolean;
  isVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  avatar?: string;
}

interface AdminCreateUserInput {
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleType?: 'ADMIN' | 'USER' | 'GUEST';
  isActive?: boolean;
  isVerified?: boolean;
  avatar?: string;
}

interface UpdateUserInput {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// Query hooks

/**
 * useSearchUsers - Dynamic search users with flexible filtering
 * Uses Universal Dynamic Query System for maximum flexibility
 * 
 * @example
 * const result = useSearchUsers({
 *   search: 'john',
 *   roleType: 'ADMIN',
 *   isActive: true,
 *   page: 0,
 *   size: 20
 * });
 * 
 * // Access data
 * const { users, total, loading, error, refetch } = result;
 */
export function useSearchUsers(input: UserSearchInput = {}, options?: { skip?: boolean }) {
  // Build dynamic where condition
  const whereCondition = useMemo(() => {
    const where: any = {};
    
    // Search across multiple fields
    if (input.search && input.search.trim()) {
      where.OR = [
        { email: { contains: input.search, mode: 'insensitive' } },
        { username: { contains: input.search, mode: 'insensitive' } },
        { firstName: { contains: input.search, mode: 'insensitive' } },
        { lastName: { contains: input.search, mode: 'insensitive' } },
      ];
    }
    
    // Filter by role type
    if (input.roleType) {
      where.roleType = { equals: input.roleType };
    }
    
    // Filter by active status
    if (input.isActive !== undefined) {
      where.isActive = { equals: input.isActive };
    }
    
    // Filter by verified status
    if (input.isVerified !== undefined) {
      where.isVerified = { equals: input.isVerified };
    }
    
    // Date range filters
    if (input.createdAfter) {
      where.createdAt = { ...(where.createdAt || {}), gte: input.createdAfter };
    }
    
    if (input.createdBefore) {
      where.createdAt = { ...(where.createdAt || {}), lte: input.createdBefore };
    }
    
    return where;
  }, [input.search, input.roleType, input.isActive, input.isVerified, input.createdAfter, input.createdBefore]);

  // Build orderBy condition
  const orderBy = useMemo(() => {
    const sortBy = input.sortBy || 'createdAt';
    const sortOrder = input.sortOrder || 'desc';
    return { [sortBy]: sortOrder };
  }, [input.sortBy, input.sortOrder]);

  // Calculate pagination
  const page = input.page || 0;
  const size = input.size || 20;

  // Fetch users with Dynamic Query
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useDynamicFindMany({
    model: 'user',
    where: whereCondition,
    orderBy,
    pagination: {
      page,
      limit: size,
      sortBy: input.sortBy || 'createdAt',
      sortOrder: input.sortOrder || 'desc',
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      roleType: true,
      isActive: true,
      isVerified: true,
      isTwoFactorEnabled: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  }, {
    fetchPolicy: 'cache-and-network',
    skip: options?.skip,
  });

  // Count total users
  const { data: countData, loading: countLoading, error: countError } = useDynamicCount({
    model: 'user',
    where: whereCondition,
  }, {
    fetchPolicy: 'cache-and-network',
    skip: options?.skip,
  });

  // Extract and transform data
  const users = usersData?.dynamicFindMany?.data || [];
  const total = countData?.dynamicCount?.data || 0;
  const totalPages = Math.ceil(total / size);
  const loading = usersLoading || countLoading;
  const error = usersError || countError;

  // Refetch function
  const refetch = async (newInput?: UserSearchInput) => {
    if (newInput) {
      // Note: For complex refetch with new params, component should call hook with new params
      console.warn('useSearchUsers: refetch with new input not fully supported. Re-render component with new input instead.');
    }
    await Promise.all([
      refetchUsers(),
      // Count will auto-refetch due to same where condition
    ]);
  };

  return {
    data: {
      searchUsers: {
        users,
        total,
        page,
        size,
        totalPages,
      },
    },
    users,
    total,
    page,
    size,
    totalPages,
    loading,
    error,
    refetch,
  };
}

export function useUserStats(options?: { skip?: boolean }) {
  return useQuery(GET_USER_STATS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: options?.skip,
  });
}

export function useUserById(id: string) {
  return useQuery(GET_USER_BY_ID, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });
}

export function useAllUsers() {
  return useQuery(GET_ALL_USERS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
}

// Mutation hooks
export function useAdminUpdateUser() {
  const client = useApolloClient();
  
  return useMutation(ADMIN_UPDATE_USER, {
    onCompleted: () => {
      // Refetch queries to update cache
      // Note: Dynamic queries will auto-update, but we keep these for compatibility
      client.refetchQueries({
        include: [GET_ALL_USERS, GET_USER_STATS],
      });
    },
    errorPolicy: 'all',
  });
}

export function useAdminCreateUser() {
  const client = useApolloClient();
  
  return useMutation(ADMIN_CREATE_USER, {
    onCompleted: () => {
      // Refetch queries to update cache
      // Note: Dynamic queries will auto-update, but we keep these for compatibility
      client.refetchQueries({
        include: [GET_ALL_USERS, GET_USER_STATS],
      });
    },
    errorPolicy: 'all',
  });
}

export function useBulkUserAction() {
  const client = useApolloClient();
  
  return useMutation(BULK_USER_ACTION, {
    onCompleted: () => {
      // Refetch queries to update cache
      // Note: Dynamic queries will auto-update, but we keep these for compatibility
      client.refetchQueries({
        include: [GET_ALL_USERS, GET_USER_STATS],
      });
    },
    errorPolicy: 'all',
  });
}

export function useDeleteUser() {
  const client = useApolloClient();
  
  return useMutation(DELETE_USER, {
    onCompleted: () => {
      // Refetch queries to update cache
      // Note: Dynamic queries will auto-update, but we keep these for compatibility
      client.refetchQueries({
        include: [GET_ALL_USERS, GET_USER_STATS],
      });
    },
    errorPolicy: 'all',
  });
}

export function useUpdateUser() {
  const client = useApolloClient();
  
  return useMutation(UPDATE_USER, {
    onCompleted: () => {
      // Refetch queries to update cache
      // Note: Dynamic queries will auto-update, but we keep these for compatibility
      client.refetchQueries({
        include: [GET_USER_BY_ID],
      });
    },
    errorPolicy: 'all',
  });
}
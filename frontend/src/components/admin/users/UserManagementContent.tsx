/**
 * UserManagementContent Component
 * 
 * Main content component for user management
 * Handles all user-related logic and state
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useSearchUsers, useUserStats, useBulkUserAction } from '@/lib/hooks/useUserManagement';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import sub-components
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { ErrorState } from './ErrorState';
import { UserTable } from './UserTable';

interface UserSearchFilters {
  search: string;
  roleType?: 'ADMIN' | 'USER' | 'GUEST';
  isActive?: boolean;
  isVerified?: boolean;
  page: number;
  size: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function UserManagementContent() {
  // State management
  const [filters, setFilters] = useState<UserSearchFilters>({
    search: '',
    roleType: undefined,
    isActive: undefined,
    isVerified: undefined,
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Build search input - Now compatible with Dynamic Query System
  const searchInput = useMemo(() => {
    const input: any = {
      page: filters.page,
      size: filters.size,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.search?.trim()) {
      input.search = filters.search.trim();
    }

    if (filters.roleType) {
      input.roleType = filters.roleType;
    }

    if (filters.isActive !== undefined) {
      input.isActive = filters.isActive;
    }

    if (filters.isVerified !== undefined) {
      input.isVerified = filters.isVerified;
    }

    return input;
  }, [filters]);

  // GraphQL hooks - Using new Dynamic Query System
  const { 
    users,
    total,
    page,
    size,
    totalPages,
    loading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers 
  } = useSearchUsers(searchInput);

  const { data: statsData, loading: statsLoading } = useUserStats();
  const [bulkUserAction, { loading: bulkActionLoading }] = useBulkUserAction();

  // Handle filter changes
  const handleFilterChange = (key: keyof UserSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 0 : value, // Reset page when other filters change
    }));
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    handleFilterChange('search', searchTerm);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    handleFilterChange('size', newSize);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    handleFilterChange('page', newPage);
  };

  // Handle sorting
  const handleSort = (sortBy: string, sortOrder: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy, 
      sortOrder: sortOrder as 'asc' | 'desc' 
    }));
  };

  // Handle user selection
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (userIds: string[]) => {
    // If all current page users are selected, deselect all
    // Otherwise, select all users on current page
    const allCurrentPageSelected = userIds.every(id => selectedUsers.includes(id));
    
    if (allCurrentPageSelected) {
      // Deselect all users on current page
      setSelectedUsers(prev => prev.filter(id => !userIds.includes(id)));
    } else {
      // Select all users on current page (merge with existing selection)
      setSelectedUsers(prev => {
        const newSelection = [...prev];
        userIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, newRole?: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select users to perform bulk actions.',
        type: 'error',
        variant: 'destructive',
      });
      return;
    }

    // Validate userIds are UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = selectedUsers.filter(id => !uuidRegex.test(id));
    
    if (invalidIds.length > 0) {
      console.error('Invalid user IDs detected:', invalidIds);
      toast({
        title: 'Invalid user selection',
        description: 'Some selected users have invalid IDs. Please refresh and try again.',
        type: 'error',
        variant: 'destructive',
      });
      setSelectedUsers([]);
      return;
    }

    try {
      const result = await bulkUserAction({
        variables: {
          input: {
            userIds: selectedUsers,
            action,
            newRole: newRole?.toUpperCase(),
          },
        },
      });

      if (result.data?.bulkUserAction?.success) {
        toast({
          title: 'Bulk action completed',
          description: result.data.bulkUserAction.message,
          type: 'success',
        });
        setSelectedUsers([]);
        refetchUsers();
      } else {
        const errorMessage = result.data?.bulkUserAction?.message || 'Unknown error occurred';
        const errors = result.data?.bulkUserAction?.errors || [];
        
        toast({
          title: 'Bulk action failed',
          description: errors.length > 0 ? errors.join(', ') : errorMessage,
          type: 'error',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Bulk action error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to perform bulk action';
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors.map((e: any) => e.message).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  // Handle export
  const handleExport = async () => {
    toast({
      title: 'Export started',
      description: 'User data export is being prepared...',
      type: 'info',
    });
    // TODO: Implement actual export functionality
  };

  // Handle delete user
  const handleDeleteUser = async (user: any) => {
    try {
      await bulkUserAction({
        variables: {
          input: {
            userIds: [user.id],
            action: 'delete',
          },
        },
      });

      toast({
        title: 'Success',
        description: `User ${user.username} has been deleted.`,
        type: 'success',
      });

      // Remove from selection if selected
      setSelectedUsers(prev => prev.filter(id => id !== user.id));
      
      // Refetch users
      await refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  // Handle errors
  if (usersError) {
    return (
      <ErrorState
        title="Error Loading Users"
        message={usersError.message || 'Failed to load users data'}
        onRetry={() => refetchUsers()}
        retryLabel="Retry Loading Users"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Users Table */}
  <UserTable
            data={{
              users,
              total,
              page,
              size,
              totalPages,
            }}
            loading={usersLoading}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onCreateUser={() => setIsCreateModalOpen(true)}
            onEditUser={setEditingUser}
            onDeleteUser={handleDeleteUser}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetchUsers();
        }}
      />

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => {
          setEditingUser(null);
          refetchUsers();
        }}
      />
    </div>
  );
}

'use client';

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { AdvancedTable, ColumnDef, RowData, TableConfig, SortConfig } from '@/components/ui/advanced-table';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Clock,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TablePagination } from './TablePagination';
import { UserTableSkeleton } from './UserTableSkeleton';

interface User extends RowData {
  id: string;
  email?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  roleType: string;
  isActive: boolean;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface UserTableProps {
  data?: UserSearchResult;
  loading?: boolean;
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: (userIds: string[]) => void;
  onSort: (sortBy: string, sortOrder: string) => void;
  onPageChange: (page: number) => void;
  onCreateUser?: () => void;
  onEditUser: (user: User) => void;
  onActivateUser?: (user: User) => void;
  onDeactivateUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  sortBy: string;
  sortOrder: string;
}

export function UserTable({
  data,
  loading,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onSort,
  onPageChange,
  onCreateUser,
  onEditUser,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
  sortBy,
  sortOrder,
}: UserTableProps) {
  const users = data?.users || [];

  // Helper functions
  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'destructive' | 'secondary' => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      case 'guest':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Column definitions for AdvancedTable
  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      field: 'username',
      headerName: 'User',
      width: 250,
      pinned: 'left',
      sortable: true,
      filterable: true,
      cellRenderer: ({ data }) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={data.avatar} alt={getDisplayName(data)} />
            <AvatarFallback className="text-xs">
              {getInitials(data)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">
              {getDisplayName(data)}
            </div>
            <div className="text-sm text-gray-500">@{data.username}</div>
          </div>
        </div>
      )
    },
    {
      field: 'email',
      headerName: 'Contact',
      width: 280,
      sortable: true,
      filterable: true,
      cellRenderer: ({ data }) => (
        <div className="space-y-1">
          {data.email && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="w-3 h-3 flex-shrink-0" />
              {data.phone}
            </div>
          )}
        </div>
      )
    },
    {
      field: 'roleType',
      headerName: 'Role',
      width: 120,
      type: 'select',
      sortable: true,
      filterable: true,
      filterOptions: ['ADMIN', 'USER', 'GUEST'],
      cellRenderer: ({ value }) => (
        <Badge variant={getRoleBadgeVariant(value)}>
          {value}
        </Badge>
      )
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 180,
      type: 'boolean',
      sortable: true,
      filterable: true,
      cellRenderer: ({ data }) => {
        const isLocked = data.lockedUntil && new Date(data.lockedUntil) > new Date();
        
        return (
          <div className="flex items-center gap-2">
            {!data.isActive ? (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            ) : isLocked ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            
            {data.isVerified && (
              <div title="Verified">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
            )}
            {data.isTwoFactorEnabled && (
              <div className="w-2 h-2 bg-blue-600 rounded-full" title="2FA Enabled" />
            )}
          </div>
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 180,
      type: 'date',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {formatDistanceToNow(new Date(value), { addSuffix: true })}
          </span>
        </div>
      )
    },
    {
      field: 'lastLoginAt',
      headerName: 'Last Login',
      width: 180,
      type: 'date',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => {
        if (!value) {
          return <span className="text-sm text-gray-400">Never</span>;
        }
        return (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {formatDistanceToNow(new Date(value), { addSuffix: true })}
            </span>
          </div>
        );
      }
    },
    {
      field: 'id',
      headerName: 'Actions',
      width: 100,
      pinned: 'right',
      sortable: false,
      filterable: false,
      cellRenderer: ({ data }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditUser(data)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => data.isActive 
                ? onDeactivateUser && onDeactivateUser(data)
                : onActivateUser && onActivateUser(data)
              }
            >
              {data.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDeleteUser && onDeleteUser(data)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ], [onEditUser, onActivateUser, onDeactivateUser, onDeleteUser]);

  // Advanced table configuration
  const tableConfig: TableConfig = {
    enableSorting: true,
    enableFiltering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableColumnHiding: true,
    enableRowSelection: true,
    enableInlineEditing: false,
    enableDialogEditing: false,
    enableRowDeletion: true,
    rowHeight: 60,
    headerHeight: 48,
    showToolbar: true,
    showPagination: false,
    virtualScrolling: false,
  };

  // Track internal selection state to avoid conflicts with parent
  const internalSelectionRef = useRef<Set<string>>(new Set(selectedUsers));

  // Update internal ref when parent selection changes
  useEffect(() => {
    internalSelectionRef.current = new Set(selectedUsers);
  }, [selectedUsers]);

  // Handle row selection from AdvancedTable
  const handleRowSelect = useMemo(() => (selectedRows: User[]) => {
    const selectedIds = selectedRows.map(r => r.id);
    const allUserIds = users.map(u => u.id);
    
    // Update internal ref
    const newSelection = new Set(selectedIds);
    const oldSelection = internalSelectionRef.current;
    
    // Find changes
    const added = selectedIds.filter(id => !oldSelection.has(id));
    const removed = Array.from(oldSelection).filter(id => allUserIds.includes(id) && !newSelection.has(id));
    
    internalSelectionRef.current = newSelection;
    
    // Notify parent of changes
    if (added.length > 0 || removed.length > 0) {
      // Check if all page users are now selected
      if (selectedIds.length === allUserIds.length && allUserIds.length > 0) {
        onSelectAll(allUserIds);
      } else {
        // Toggle individual items
        [...added, ...removed].forEach(id => onSelectUser(id));
      }
    }
  }, [users, onSelectUser, onSelectAll]);

  // Handle sorting from AdvancedTable
  const handleSort = useCallback((sortConfigs: SortConfig[]) => {
    if (sortConfigs.length > 0) {
      const primarySort = sortConfigs[0];
      onSort(String(primarySort.field), primarySort.direction || 'asc');
    }
  }, [onSort]);

  // Handle create user
  const handleCreateUser = useCallback((newRow: Partial<User>) => {
    if (onCreateUser) {
      onCreateUser();
    }
    return Promise.resolve(true);
  }, [onCreateUser]);

  // Handle edit user (inline or dialog editing)
  const handleEditUser = useCallback((user: User, field: keyof User, newValue: any) => {
    // For now, just trigger the onEditUser callback
    // You can implement inline editing logic here if needed
    onEditUser(user);
    return Promise.resolve(true);
  }, [onEditUser]);

  // Handle delete users (bulk delete)
  const handleDeleteUsers = useCallback((usersToDelete: User[]) => {
    if (onDeleteUser && usersToDelete.length > 0) {
      // Delete first user as example, or handle bulk delete
      usersToDelete.forEach(user => onDeleteUser(user));
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }, [onDeleteUser]);

  if (loading) {
    return <UserTableSkeleton rows={5} />;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No users found</div>
        <div className="text-sm text-gray-400">Try adjusting your search criteria</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdvancedTable<User>
        columns={columns}
        data={users}
        config={tableConfig}
        loading={loading}
        onRowSelect={handleRowSelect}
        onSort={handleSort}
        onRowCreate={onCreateUser ? handleCreateUser : undefined}
        onRowEdit={handleEditUser}
        onRowDelete={onDeleteUser ? handleDeleteUsers : undefined}
        height={600}
        className="border rounded-lg"
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <TablePagination
          currentPage={data.page}
          totalPages={data.totalPages}
          pageSize={data.size}
          totalItems={data.total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
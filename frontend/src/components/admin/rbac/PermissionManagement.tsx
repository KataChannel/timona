import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Key, Search } from 'lucide-react';
import { useSearchPermissions, useDeletePermission } from '../../../hooks/useRbac';
import { Permission, PermissionSearchInput } from '../../../types/rbac.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import CreatePermissionModal from './CreatePermissionModal';
import EditPermissionModal from './EditPermissionModal';


interface PermissionManagementProps {
  className?: string;
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ className = '' }) => {
  const [searchInput, setSearchInput] = useState<PermissionSearchInput>({
    page: 0,
    size: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const { data, loading, error, refetch } = useSearchPermissions(searchInput);
  const [deletePermission] = useDeletePermission();
  const { toast } = useToast();

  // Manual search function
  const handleSearch = () => {
    setSearchInput(prev => ({ 
      ...prev, 
      search: searchTerm || undefined, 
      page: 0 
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchInput(prev => ({ ...prev, page }));
  };

  const handleDelete = async (permission: Permission) => {
    if (permission.isSystemPerm) {
      toast({
        title: 'Cannot delete system permission',
        description: 'System permissions cannot be deleted for security reasons.',
        type: 'error',
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete permission "${permission.displayName}"?`)) {
      try {
        await deletePermission({ variables: { id: permission.id } });
        toast({
          title: 'Permission deleted',
          description: `Permission "${permission.displayName}" has been deleted successfully.`,
          type: 'success',
        });
        refetch();
      } catch (error: any) {
        toast({
          title: 'Delete failed',
          description: error.message || 'Failed to delete permission',
          type: 'error',
        });
      }
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingPermission(null);
    refetch();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className={`border-red-200 bg-red-50 text-red-800 ${className}`}>
        <AlertDescription>
          Error loading permissions: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const permissions = data?.searchPermissions?.permissions || [];
  const total = data?.searchPermissions?.total || 0;
  const totalPages = data?.searchPermissions?.totalPages || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle>Quản lý Quyền hạn</CardTitle>
            <CardDescription>
              Định nghĩa và quản lý quyền hạn hệ thống
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Permission mới
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters - Mobile First */}
        <div className="flex flex-col gap-3">
          {/* Search Input Row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button 
              variant="secondary"
              size="icon"
              onClick={handleSearch}
              className="flex-shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Resource (vd: lms)"
              value={searchInput.resource || ''}
              onChange={(e) => setSearchInput(prev => ({ ...prev, resource: e.target.value || undefined, page: 0 }))}
              className="w-full sm:w-40"
            />
            <Input
              type="text"
              placeholder="Action (vd: read)"
              value={searchInput.action || ''}
              onChange={(e) => setSearchInput(prev => ({ ...prev, action: e.target.value || undefined, page: 0 }))}
              className="w-full sm:w-40"
            />
            <Select
              value={searchInput.isActive === undefined ? 'all' : searchInput.isActive.toString()}
              onValueChange={(value) => setSearchInput(prev => ({ 
                ...prev, 
                isActive: value === 'all' ? undefined : value === 'true',
                page: 0 
              }))}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Resource:Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No permissions found
                  </TableCell>
                </TableRow>
              ) : (
                permissions.map((permission: Permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted">
                            <Key className="h-5 w-5 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{permission.displayName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {permission.name}
                            {permission.isSystemPerm && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                          </div>
                          {permission.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {permission.resource}:{permission.action}
                        {permission.scope && (
                          <span className="text-muted-foreground">:{permission.scope}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={permission.isActive ? 'default' : 'destructive'}>
                        {permission.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(permission.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPermission(permission)}
                          title="Edit Permission"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!permission.isSystemPerm && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(permission)}
                            title="Delete Permission"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {(searchInput.page || 0) * (searchInput.size || 20) + 1} to{' '}
              {Math.min(((searchInput.page || 0) + 1) * (searchInput.size || 20), total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((searchInput.page || 0) - 1)}
                disabled={(searchInput.page || 0) <= 0}
              >
                Previous
              </Button>
              <div className="text-sm font-medium px-3 py-1 bg-muted rounded-md">
                {(searchInput.page || 0) + 1} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((searchInput.page || 0) + 1)}
                disabled={(searchInput.page || 0) >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modals */}
      {showCreateModal && (
        <CreatePermissionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingPermission && (
        <EditPermissionModal
          isOpen={!!editingPermission}
          permission={editingPermission}
          onClose={() => setEditingPermission(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </Card>
  );
};

export default PermissionManagement;
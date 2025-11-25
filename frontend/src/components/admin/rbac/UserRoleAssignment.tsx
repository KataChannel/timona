import React, { useState } from 'react';
import { Search, User, ShieldCheck } from 'lucide-react';
import { useSearchUsers } from '../../../lib/hooks/useUserManagement';
import { useGetUserRolePermissions, useAssignUserRoles, useAssignUserPermissions } from '../../../hooks/useRbac';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import UserRolePermissionModal from './UserRolePermissionModal';

interface UserRoleAssignmentProps {
  className?: string;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, loading: usersLoading } = useSearchUsers({
    search: searchQuery,
    page: 0,
    size: 50,
  });

  const users = usersData?.searchUsers?.users || [];

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  if (usersLoading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn User</CardTitle>
            <CardDescription>
              Chọn người dùng để quản lý vai trò và quyền hạn
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search - Mobile First */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm users..."
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

            {/* User List */}
            <ScrollArea className="h-[400px]">
              {users.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user: any) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                        selectedUser?.id === user.id ? 'bg-accent border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.displayName || user.username}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <Badge 
                              variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                              className="shrink-0"
                            >
                              {user.role}
                            </Badge>
                          </div>
                          {user.isActive === false && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Role & Permission Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>
                  {selectedUser ? 'Role & Permission Details' : 'User Details'}
                </CardTitle>
                <CardDescription>
                  {selectedUser 
                    ? `Manage roles and permissions for ${selectedUser.displayName || selectedUser.username}`
                    : 'Select a user to view their role and permission details'
                  }
                </CardDescription>
              </div>
              {selectedUser && (
                <Button
                  onClick={() => setSelectedUser(selectedUser)}
                  variant="secondary"
                  size="sm"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Manage Access
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {selectedUser ? (
              <UserRolePermissionPreview user={selectedUser} />
            ) : (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No user selected</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a user from the list to view their role and permission details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Role Permission Modal */}
      {selectedUser && (
        <UserRolePermissionModal
          isOpen={!!selectedUser}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

// User Role Permission Preview Component
const UserRolePermissionPreview: React.FC<{ user: any }> = ({ user }) => {
  const { data: rolePermissionsData, loading } = useGetUserRolePermissions(user.id);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
        <Separator />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const summary = rolePermissionsData?.getUserRolePermissions?.summary;
  const roleAssignments = rolePermissionsData?.getUserRolePermissions?.roleAssignments || [];
  const directPermissions = rolePermissionsData?.getUserRolePermissions?.directPermissions || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4 border-2 hover:border-primary/50 transition-colors">
          <div className="text-2xl font-bold text-primary">
            {summary?.totalRoleAssignments || 0}
          </div>
          <div className="text-sm text-muted-foreground">Roles</div>
        </Card>
        <Card className="text-center p-4 border-2 hover:border-green-500/50 transition-colors">
          <div className="text-2xl font-bold text-green-600">
            {summary?.totalDirectPermissions || 0}
          </div>
          <div className="text-sm text-muted-foreground">Direct Permissions</div>
        </Card>
        <Card className="text-center p-4 border-2 hover:border-purple-500/50 transition-colors">
          <div className="text-2xl font-bold text-purple-600">
            {summary?.totalEffectivePermissions || 0}
          </div>
          <div className="text-sm text-muted-foreground">Total Permissions</div>
        </Card>
      </div>

      <Separator />

      {/* Current Roles */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />
          Current Roles
        </h4>
        {roleAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roles assigned</p>
        ) : (
          <div className="space-y-2">
            {roleAssignments.slice(0, 3).map((assignment: any) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-3 w-3 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{assignment.role.displayName}</p>
                </div>
                <Badge variant={assignment.effect === 'allow' ? 'default' : 'destructive'}>
                  {assignment.effect}
                </Badge>
              </div>
            ))}
            {roleAssignments.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{roleAssignments.length - 3} more roles
              </p>
            )}
          </div>
        )}
      </div>

      {/* Direct Permissions */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Direct Permissions
        </h4>
        {directPermissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No direct permissions assigned</p>
        ) : (
          <div className="space-y-2">
            {directPermissions.filter((p: any) => p.permission).slice(0, 3).map((permission: any) => (
              <div 
                key={permission.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-green-100">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{permission.permission?.displayName || 'Unknown Permission'}</p>
                </div>
                <Badge variant={permission.effect === 'allow' ? 'default' : 'destructive'}>
                  {permission.effect}
                </Badge>
              </div>
            ))}
            {directPermissions.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{directPermissions.length - 3} more permissions
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleAssignment;
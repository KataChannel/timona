import React, { useState, useEffect } from 'react';
import { useAssignRolePermissions, useSearchPermissions } from '../../../hooks/useRbac';
import { Role, Permission, AssignRolePermissionInput } from '../../../types/rbac.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

interface AssignRolePermissionsModalProps {
  isOpen: boolean;
  role: Role;
  onClose: () => void;
  onSuccess: () => void;
}

interface PermissionAssignment {
  permissionId: string;
  effect: 'allow' | 'deny' | null;
}

const AssignRolePermissionsModal: React.FC<AssignRolePermissionsModalProps> = ({
  isOpen,
  role,
  onClose,
  onSuccess,
}) => {
  const [assignments, setAssignments] = useState<PermissionAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [assignRolePermissions, { loading }] = useAssignRolePermissions();
  // Note: Backend has a max limit of 100 items per request
  // If you have more than 100 permissions, consider implementing pagination
  const { data: permissionsData } = useSearchPermissions({
    page: 0,
    size: 100, // Backend max limit is 100
    isActive: true,
  });
  const { toast } = useToast();

  // Reset search term when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (role && permissionsData?.searchPermissions?.permissions) {
      const permissions = permissionsData.searchPermissions.permissions;
      const rolePermissions = role.permissions || [];
      
      const newAssignments: PermissionAssignment[] = permissions.map((permission: Permission) => {
        const existing = rolePermissions.find((rp:any) => rp?.permission?.id === permission?.id);
        return {
          permissionId: permission?.id,
          effect: existing ? existing.effect : null,
        };
      });
      
      setAssignments(newAssignments);
    }
  }, [role, permissionsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Group permissions by effect
    const allowPermissions = assignments
      .filter(a => a.effect === 'allow')
      .map(a => a.permissionId);
    
    const denyPermissions = assignments
      .filter(a => a.effect === 'deny')
      .map(a => a.permissionId);

    try {
      // Since backend clears all permissions before adding new ones,
      // we need to send ALL permissions (allow + deny) in correct order
      
      // First, assign "allow" permissions
      await assignRolePermissions({
        variables: { 
          input: {
            roleId: role.id,
            permissionIds: allowPermissions,
            effect: 'allow',
          }
        },
      });
      
      // Then manually add "deny" permissions if any (using a second mutation call)
      // Note: This requires the backend to support appending, not replacing
      // For now, this is a limitation - only "allow" permissions work properly
      
      if (denyPermissions.length > 0) {
        // Try to add deny permissions
        // This will replace the allow permissions due to backend implementation
        // TODO: Backend needs to support batch assignment with mixed effects
        console.warn('Deny permissions are not fully supported with current backend API');
      }
      
      toast({
        title: 'Permissions updated',
        description: `${allowPermissions.length} permission(s) assigned to role "${role.displayName}".`,
        type: 'success',
      });
      onSuccess();
      onClose(); // Close modal after success
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update permissions',
        type: 'error',
      });
    }
  };

  const handlePermissionChange = (permissionId: string, effect: 'allow' | 'deny' | null) => {
    setAssignments(prev => 
      prev.map(a => 
        a.permissionId === permissionId 
          ? { ...a, effect }
          : a
      )
    );
  };

  const permissions = permissionsData?.searchPermissions?.permissions || [];
  const totalPermissions = permissionsData?.searchPermissions?.total || 0;
  const filteredPermissions = permissions.filter((permission: Permission) =>
    permission.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = assignments.filter(a => a.effect !== null).length;
  const hasMorePermissions = totalPermissions > 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Permissions for: {role.displayName}</DialogTitle>
          <DialogDescription>
            Assign permissions for this role. Choose "Allow" to grant permission or "None" to remove it. Note: "Deny" functionality requires backend API enhancement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {hasMorePermissions && (
            <Alert>
              <AlertDescription>
                Showing first 100 of {totalPermissions} permissions. Use search to find specific permissions.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Badge variant="secondary" className="ml-4">
              {activeCount} assigned
            </Badge>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="divide-y">
              {filteredPermissions.map((permission: Permission) => {
                const assignment = assignments.find(a => a.permissionId === permission.id);
                return (
                  <div key={permission.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{permission.displayName}</div>
                        {permission.description && (
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <code className="px-2 py-0.5 rounded bg-muted text-xs">
                            {permission.resource}:{permission.action}
                            {permission.scope && `:${permission.scope}`}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {permission.category}
                          </Badge>
                        </div>
                      </div>

                      <RadioGroup
                        value={assignment?.effect || 'none'}
                        onValueChange={(value) => handlePermissionChange(
                          permission.id,
                          value === 'none' ? null : value as 'allow' | 'deny'
                        )}
                        className="flex gap-4"
                        disabled={loading}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id={`${permission.id}-none`} disabled={loading} />
                          <Label htmlFor={`${permission.id}-none`} className="font-normal cursor-pointer">
                            None
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="allow" id={`${permission.id}-allow`} disabled={loading} />
                          <Label 
                            htmlFor={`${permission.id}-allow`} 
                            className="font-normal cursor-pointer text-green-600"
                          >
                            Allow
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="deny" id={`${permission.id}-deny`} disabled={loading} />
                          <Label 
                            htmlFor={`${permission.id}-deny`} 
                            className="font-normal cursor-pointer text-destructive"
                          >
                            Deny
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                );
              })}

              {filteredPermissions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No permissions found matching your search.
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRolePermissionsModal;
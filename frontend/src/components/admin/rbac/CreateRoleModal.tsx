import React, { useState } from 'react';
import { useCreateRole, useSearchPermissions } from '../../../hooks/useRbac';
import { CreateRoleInput } from '../../../types/rbac.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    displayName: '',
    description: '',
    priority: 0,
    permissionIds: [],
  });

  const [createRole, { loading }] = useCreateRole();
  const { data: permissionsData } = useSearchPermissions({
    page: 0,
    size: 100,
    isActive: true,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createRole({
        variables: {
          input: formData,
        },
      });
      toast({
        title: 'Role created',
        description: `Role "${formData.displayName}" has been created successfully.`,
        type: 'success',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Create failed',
        description: error.message || 'Failed to create role',
        type: 'error',
      });
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds?.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...(prev.permissionIds || []), permissionId],
    }));
  };

  const permissions = permissionsData?.searchPermissions?.permissions || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Role Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., user_manager"
              />
            </div>

            <div>
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                required
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., User Manager"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's purpose and responsibilities"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher numbers have higher priority
              </p>
            </div>

            {permissions.length > 0 && (
              <div>
                <Label className="mb-2 block">Permissions</Label>
                <ScrollArea className="h-48 border rounded-md p-3">
                  <div className="space-y-3">
                    {permissions.map((permission: any) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={formData.permissionIds?.includes(permission.id) || false}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <Label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-normal cursor-pointer leading-tight"
                        >
                          <div>{permission.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {permission.resource}:{permission.action}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.permissionIds?.length || 0} permissions selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
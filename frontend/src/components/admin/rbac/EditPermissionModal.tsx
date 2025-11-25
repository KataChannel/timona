import React, { useState, useEffect } from 'react';
import { useUpdatePermission } from '../../../hooks/useRbac';
import { Permission, UpdatePermissionInput } from '../../../types/rbac.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

interface EditPermissionModalProps {
  isOpen: boolean;
  permission: Permission;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPermissionModal: React.FC<EditPermissionModalProps> = ({
  isOpen,
  permission,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdatePermissionInput>({
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    scope: '',
    category: 'general',
    isActive: true,
  });

  const [updatePermission, { loading }] = useUpdatePermission();
  const { toast } = useToast();

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        displayName: permission.displayName,
        description: permission.description || '',
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope || '',
        category: permission.category,
        isActive: permission.isActive,
      });
    }
  }, [permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updatePermission({
        variables: {
          id: permission.id,
          input: {
            ...formData,
            scope: formData.scope || undefined,
          },
        },
      });
      toast({
        title: 'Permission updated',
        description: `Permission "${formData.displayName}" has been updated successfully.`,
        type: 'success',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update permission',
        type: 'error',
      });
    }
  };

  const categories = [
    'general',
    'user',
    'admin',
    'content',
    'system',
    'reporting',
    'billing',
    'integration',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Permission: {permission.displayName}</DialogTitle>
          <DialogDescription>
            Update permission details. System permissions have limited editability to ensure system stability.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {permission.isSystemPerm && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a system permission. Some properties cannot be modified to ensure system stability.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Permission Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., user:read:own"
                disabled={permission.isSystemPerm}
              />
              {permission.isSystemPerm && (
                <p className="text-xs text-muted-foreground mt-1">
                  System permission names cannot be changed
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                required
                value={formData.displayName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Read Own User Data"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this permission allows"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource">
                  Resource <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="resource"
                  required
                  value={formData.resource || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
                  placeholder="e.g., user, post, comment"
                  disabled={permission.isSystemPerm}
                />
              </div>

              <div>
                <Label htmlFor="action">
                  Action <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="action"
                  required
                  value={formData.action || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                  placeholder="e.g., read, write, delete"
                  disabled={permission.isSystemPerm}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                value={formData.scope || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                placeholder="e.g., own, all, team (optional)"
                disabled={permission.isSystemPerm}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional scope qualifier for the permission
              </p>
            </div>

            <div>
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category || 'general'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                disabled={permission.isSystemPerm}
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                Active
              </Label>
            </div>
            {permission.isSystemPerm && (
              <p className="text-xs text-muted-foreground">
                System permissions cannot be deactivated
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPermissionModal;
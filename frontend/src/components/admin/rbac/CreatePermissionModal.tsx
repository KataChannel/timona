import React, { useState } from 'react';
import { useCreatePermission } from '../../../hooks/useRbac';
import { CreatePermissionInput } from '../../../types/rbac.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePermissionModal: React.FC<CreatePermissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreatePermissionInput>({
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    scope: '',
    category: 'general',
  });

  const [createPermission, { loading }] = useCreatePermission();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPermission({
        variables: {
          input: {
            ...formData,
            scope: formData.scope || undefined,
          },
        },
      });
      toast({
        title: 'Permission created',
        description: `Permission "${formData.displayName}" has been created successfully.`,
        type: 'success',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Create failed',
        description: error.message || 'Failed to create permission',
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
          <DialogTitle>Create New Permission</DialogTitle>
          <DialogDescription>
            Define a new permission for the RBAC system. Use the format resource:action:scope for the permission name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Permission Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., user:read:own"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use the format: resource:action:scope
              </p>
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
                  value={formData.resource}
                  onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
                  placeholder="e.g., user, post, comment"
                />
              </div>

              <div>
                <Label htmlFor="action">
                  Action <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="action"
                  required
                  value={formData.action}
                  onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                  placeholder="e.g., read, write, delete"
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
              {loading ? 'Creating...' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePermissionModal;
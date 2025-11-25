import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldCheck, Menu, Info } from 'lucide-react';
import { useUpdateRole, useSearchPermissions, useAssignRolePermissions } from '../../../hooks/useRbac';
import { Role, UpdateRoleInput, Permission } from '../../../types/rbac.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery, gql } from '@apollo/client';

interface EditRoleModalProps {
  isOpen: boolean;
  role: Role;
  onClose: () => void;
  onSuccess: () => void;
}

interface PermissionAssignment {
  permissionId: string;
  effect: 'allow' | 'deny' | null;
}

const GET_ALL_MENUS = gql`
  query GetAllMenus {
    menus(filter: { isActive: true }) {
      items {
        id
        title
        path
        type
        icon
        requiredRoles
        requiredPermissions
      }
    }
  }
`;

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  role,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<UpdateRoleInput>({
    name: '',
    displayName: '',
    description: '',
    priority: 0,
    isActive: true,
  });
  const [permissionAssignments, setPermissionAssignments] = useState<PermissionAssignment[]>([]);
  const [searchPermissionTerm, setSearchPermissionTerm] = useState('');

  const [updateRole, { loading }] = useUpdateRole();
  const [assignRolePermissions, { loading: assigningPermissions }] = useAssignRolePermissions();
  const { data: permissionsData } = useSearchPermissions({
    page: 0,
    size: 100,
    isActive: true,
  });
  const { data: menusData } = useQuery(GET_ALL_MENUS, {
    skip: !role?.name || activeTab !== 'menus',
  });
  const { toast } = useToast();

  // Initialize form data
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        priority: role.priority,
        isActive: role.isActive,
      });
    }
  }, [role]);

  // Initialize permission assignments
  useEffect(() => {
    if (role && permissionsData?.searchPermissions?.permissions) {
      const permissions = permissionsData.searchPermissions.permissions;
      const rolePermissions = role.permissions || [];
      
      console.log('🔍 EditRoleModal Debug:', {
        roleName: role.name,
        rolePermissionsCount: rolePermissions.length,
        rolePermissionsStructure: rolePermissions[0],
        allPermissionsCount: permissions.length
      });
      
      const newAssignments: PermissionAssignment[] = permissions.map((permission: Permission) => {
        // SEARCH_ROLES now returns permissions with nested structure:
        // permissions: [{ id, effect, permission: { id, name, displayName, ... } }]
        // So we need to check permission.permission.id against rolePermissions
        const existing = rolePermissions.find((rp: any) => rp?.permission?.id === permission?.id);
        
        return {
          permissionId: permission?.id,
          effect: existing?.effect || null, // Use the actual effect from the relationship
        };
      });
      
      console.log('✅ Permission assignments created:', {
        total: newAssignments.length,
        assigned: newAssignments.filter(a => a.effect).length
      });
      
      setPermissionAssignments(newAssignments);
    }
  }, [role, permissionsData]);

  // Reset search when modal closes or tab changes
  useEffect(() => {
    if (!isOpen) {
      setSearchPermissionTerm('');
      setActiveTab('info');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRole({
        variables: {
          id: role.id,
          input: formData,
        },
      });
      toast({
        title: 'Role updated',
        description: `Role "${formData.displayName}" has been updated successfully.`,
        type: 'success',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update role',
        type: 'error',
      });
    }
  };

  const handleSavePermissions = async () => {
    try {
      // Group permissions by effect
      const allowPermissions = permissionAssignments
        .filter(a => a.effect === 'allow')
        .map(a => a.permissionId);
      
      await assignRolePermissions({
        variables: { 
          input: {
            roleId: role.id,
            permissionIds: allowPermissions,
            effect: 'allow',
          }
        },
      });
      
      toast({
        title: 'Permissions updated',
        description: `${allowPermissions.length} permission(s) assigned to role "${role.displayName}".`,
        type: 'success',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update permissions',
        type: 'error',
      });
    }
  };

  const handlePermissionChange = (permissionId: string, effect: 'allow' | 'deny' | null) => {
    setPermissionAssignments(prev => 
      prev.map(a => 
        a.permissionId === permissionId 
          ? { ...a, effect }
          : a
      )
    );
  };

  const permissions = permissionsData?.searchPermissions?.permissions || [];
  const filteredPermissions = permissions.filter((permission: Permission) =>
    permission.displayName.toLowerCase().includes(searchPermissionTerm.toLowerCase()) ||
    permission.name.toLowerCase().includes(searchPermissionTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchPermissionTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchPermissionTerm.toLowerCase())
  );
  const activePermissionsCount = permissionAssignments.filter(a => a.effect !== null).length;
  
  // Filter menus that have this role in requiredRoles
  const allMenus = menusData?.menus?.items || [];
  const accessibleMenus = allMenus.filter((menu: any) => 
    menu.requiredRoles && Array.isArray(menu.requiredRoles) && 
    menu.requiredRoles.includes(role?.name)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Vai trò: {role.displayName}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin, quyền hạn và menu cho vai trò
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Quyền hạn
              {activePermissionsCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activePermissionsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="menus" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Menu
              {accessibleMenus.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {accessibleMenus.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {role.isSystemRole && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>System Role:</strong> Some properties cannot be modified to ensure system stability.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Role Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., user_manager"
                    disabled={role.isSystemRole}
                  />
                  {role.isSystemRole && (
                    <p className="text-xs text-muted-foreground mt-1">
                      System role names cannot be changed
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
                    value={formData.priority || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher numbers have higher priority
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                    disabled={role.isSystemRole}
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                    Active
                  </Label>
                </div>
                {role.isSystemRole && (
                  <p className="text-xs text-muted-foreground">
                    System roles cannot be deactivated
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Tab 2: Permissions */}
          <TabsContent value="permissions" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Input
                  type="text"
                  placeholder="Tìm kiếm quyền..."
                  value={searchPermissionTerm}
                  onChange={(e) => setSearchPermissionTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="secondary">
                  {activePermissionsCount} được gán
                </Badge>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="divide-y">
                  {filteredPermissions.map((permission: Permission) => {
                    const assignment = permissionAssignments.find(a => a.permissionId === permission.id);
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
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id={`${permission.id}-none`} />
                              <Label htmlFor={`${permission.id}-none`} className="font-normal cursor-pointer">
                                Không
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="allow" id={`${permission.id}-allow`} />
                              <Label 
                                htmlFor={`${permission.id}-allow`} 
                                className="font-normal cursor-pointer text-green-600"
                              >
                                Cho phép
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPermissions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Không tìm thấy quyền nào phù hợp.
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button onClick={handleSavePermissions} disabled={assigningPermissions}>
                  {assigningPermissions ? 'Đang lưu...' : 'Lưu quyền hạn'}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>

          {/* Tab 3: Menus */}
          <TabsContent value="menus" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Alert>
                <Menu className="h-4 w-4" />
                <AlertDescription>
                  Danh sách các menu mà vai trò <strong>{role.displayName}</strong> có quyền truy cập.
                  Để thay đổi menu, vui lòng truy cập <strong>Quản lý Menu</strong> và chỉnh sửa trường <em>requiredRoles</em> của mỗi menu item.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="divide-y">
                  {accessibleMenus.length > 0 ? (
                    accessibleMenus.map((menu: any) => (
                      <div key={menu.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          {menu.icon && (
                            <div className="text-2xl">{menu.icon}</div>
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="font-medium">{menu.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Path: {menu.path}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {menu.type}
                              </Badge>
                              {menu.requiredPermissions && menu.requiredPermissions.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {menu.requiredPermissions.length} permissions required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Menu className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Không có menu nào được gán cho vai trò này.</p>
                      <p className="text-sm mt-2">
                        Truy cập <strong>Quản lý Menu</strong> để gán menu cho vai trò <strong>{role.name}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleModal;
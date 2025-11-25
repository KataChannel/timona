'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UserPlus, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApolloClient, gql } from '@apollo/client';
import { cn } from '@/lib/utils';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string, projectId?: string, userId?: string) => Promise<void>;
  loading?: boolean;
  projects?: Array<{ id: string; name: string }>;
  selectedProjectId?: string | null;
  onProjectChange?: (projectId: string) => void;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
  loading = false,
  projects,
  selectedProjectId,
  onProjectChange,
}: InviteMemberDialogProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState('MEMBER');
  const [localProjectId, setLocalProjectId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [existingRole, setExistingRole] = useState<string | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    userName: string;
    currentRole: string;
    newRole: string;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const { toast } = useToast();
  const apolloClient = useApolloClient();

  // Load users from database
  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  // Sync local project id with prop
  useEffect(() => {
    if (selectedProjectId) {
      setLocalProjectId(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Check membership when user is selected
  useEffect(() => {
    if (selectedUser && localProjectId) {
      checkProjectMembership(selectedUser.id);
    } else {
      setExistingRole(null);
    }
  }, [selectedUser, localProjectId]);

  // Load all users from database
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query GetAllUsers($input: UnifiedFindManyInput, $modelName: String!) {
            findMany(modelName: $modelName, input: $input)
          }
        `,
        variables: {
          modelName: 'user',
          input: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
            orderBy: {
              email: 'asc',
            },
          },
        },
        fetchPolicy: 'network-only',
      });

      let userList = data?.findMany;
      if (typeof userList === 'string') {
        userList = JSON.parse(userList);
      }

      if (Array.isArray(userList)) {
        setUsers(userList);
      }
    } catch (error) {
      console.error('[InviteMemberDialog] Load users error:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Không thể tải danh sách người dùng',
        type: 'error',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Check if user is already a member of the project
  const checkProjectMembership = async (userId: string) => {
    if (!localProjectId || !userId) return;
    
    setCheckingMembership(true);
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query CheckProjectMembership($input: UnifiedFindManyInput, $modelName: String!) {
            findMany(modelName: $modelName, input: $input)
          }
        `,
        variables: {
          modelName: 'projectMember',
          input: {
            where: {
              AND: [
                { projectId: { equals: localProjectId } },
                { userId: { equals: userId } }
              ]
            },
            select: {
              id: true,
              role: true,
            },
          },
        },
        fetchPolicy: 'network-only',
      });

      let members = data?.findMany;
      if (typeof members === 'string') {
        members = JSON.parse(members);
      }

      if (members && Array.isArray(members) && members.length > 0) {
        const member = members[0];
        setExistingRole(member.role || 'MEMBER');
      } else {
        setExistingRole(null);
      }
    } catch (error) {
      console.error('[InviteMemberDialog] Check membership error:', error);
      setExistingRole(null);
    } finally {
      setCheckingMembership(false);
    }
  };

  // Check if form is valid
  const isFormValid = React.useMemo(() => {
    // User must be selected
    if (!selectedUser) return false;
    
    // Role must be selected
    if (!role) return false;
    
    // Project must be selected if projects list exists
    if (projects && projects.length > 0 && !localProjectId) return false;
    
    return true;
  }, [selectedUser, role, projects, localProjectId]);



  // Helper function to get role display name
  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'OWNER': 'Owner',
      'ADMIN': 'Admin',
      'MEMBER': 'Member',
    };
    return roleMap[role.toUpperCase()] || role;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !role) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn người dùng và vai trò',
        type: 'error',
        variant: 'destructive',
      });
      return;
    }

    // Validate project selection if projects list is provided
    if (projects && projects.length > 0 && !localProjectId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn dự án',
        type: 'error',
        variant: 'destructive',
      });
      return;
    }

    // If user is already a member, ask for confirmation to change role
    if (existingRole) {
      const currentRoleName = getRoleDisplayName(existingRole);
      const newRoleName = getRoleDisplayName(role);
      const userName = [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(' ') || 'Không có tên';
      
      if (existingRole.toUpperCase() === role.toUpperCase()) {
        toast({
          title: 'ℹ️ Vai trò giống nhau',
          description: `${userName} đã có vai trò ${currentRoleName} trong dự án này.`,
          type: 'info',
          variant: 'default',
        });
        return;
      }
      
      // Show confirmation dialog
      setConfirmData({
        userName,
        currentRole: currentRoleName,
        newRole: newRoleName,
      });
      setShowConfirmDialog(true);
      return;
    }

    // Proceed with adding member
    await performAddMember();
  };

  // Perform the actual add member action
  const performAddMember = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      await onInvite(selectedUser.email, role, localProjectId || undefined, selectedUser.id);
      
      // Reset form on success
      setSelectedUser(null);
      setRole('MEMBER');
      setExistingRole(null);
      setShowConfirmDialog(false);
      setConfirmData(null);
      // Don't reset project selection
      
    } catch (error) {
      // Error handled by parent component
      console.error('[InviteMemberDialog] Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle confirm role change
  const handleConfirmRoleChange = async () => {
    setShowConfirmDialog(false);
    await performAddMember();
  };

  // Handle cancel role change
  const handleCancelRoleChange = () => {
    setShowConfirmDialog(false);
    setConfirmData(null);
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setRole('MEMBER');
    setExistingRole(null);
    onOpenChange(false);
  };

  // Get user display name
  const getUserDisplayName = (user: User) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name || user.email;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Mời thành viên
            </DialogTitle>
            <DialogDescription>
              Nhập email và chọn vai trò cho thành viên mới
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="user">
                Chọn người dùng <span className="text-red-500">*</span>
              </Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className={cn(
                      "w-full justify-between",
                      !selectedUser && "text-muted-foreground"
                    )}
                    disabled={submitting || loading || loadingUsers}
                  >
                    {loadingUsers ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách...
                      </>
                    ) : selectedUser ? (
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{getUserDisplayName(selectedUser)}</span>
                        <span className="text-xs text-muted-foreground">({selectedUser.email})</span>
                      </span>
                    ) : (
                      "Chọn người dùng..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm người dùng..." />
                    <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.email} ${user.firstName} ${user.lastName}`}
                            onSelect={() => {
                              setSelectedUser(user);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{getUserDisplayName(user)}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {selectedUser && existingRole && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
                  <span className="text-sm text-amber-600">⚠️</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-amber-800">
                      {getUserDisplayName(selectedUser)}
                    </span>
                    <span className="text-xs text-amber-600 ml-2">
                      - Vai trò hiện tại: {getRoleDisplayName(existingRole)}
                    </span>
                  </div>
                  {checkingMembership && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}
              
              {selectedUser && !existingRole && !checkingMembership && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200">
                  <span className="text-sm text-green-600">✓</span>
                  <span className="text-sm font-medium text-green-800">
                    {getUserDisplayName(selectedUser)} - Chưa tham gia dự án
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={submitting || loading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Owner</span>
                      <span className="text-xs text-muted-foreground">- Toàn quyền</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Admin</span>
                      <span className="text-xs text-muted-foreground">- Quản lý dự án</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Member</span>
                      <span className="text-xs text-muted-foreground">- Thành viên</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
              <div className="flex gap-2">
                <span className="text-blue-600 flex-shrink-0">ℹ️</span>
                <div className="text-blue-800 space-y-1">
                  <p className="font-medium">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Chọn người dùng từ danh sách có sẵn trong hệ thống</li>
                    <li>Nếu đã là thành viên, bạn có thể thay đổi vai trò</li>
                    <li>Người dùng chưa có trong danh sách cần đăng ký trước</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting || loading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || submitting || loading}
            >
              {(submitting || loading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitting ? 'Đang xử lý...' : 'Thêm thành viên'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialog for Role Change */}
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            🔄 Thay đổi vai trò
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Người dùng:</span>{' '}
              {confirmData?.userName}
            </div>
            <div className="text-sm">
              <span className="font-medium">Vai trò hiện tại:</span>{' '}
              <span className="text-amber-600">{confirmData?.currentRole}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Vai trò mới:</span>{' '}
              <span className="text-green-600">{confirmData?.newRole}</span>
            </div>
          </div>
          <div className="text-sm font-medium">
            Bạn có chắc chắn muốn thay đổi vai trò không?
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelRoleChange}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmRoleChange}>
            Xác nhận thay đổi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}

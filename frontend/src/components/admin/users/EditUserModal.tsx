'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Save, Loader2, AlertCircle, Edit, Key, Copy, CheckCheck, RefreshCw } from 'lucide-react';
import { useAdminUpdateUser } from '@/lib/hooks/useUserManagement';
import { toast } from '@/hooks/use-toast';
import { ADMIN_RESET_PASSWORD, type AdminResetPasswordResponse } from '@/graphql/admin/user-management.graphql';

interface EditUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleType: 'ADMIN' | 'USER' | 'GUEST';
  isActive: boolean;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
}

interface FormErrors {
  username?: string;
  email?: string;
  phone?: string;
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [adminUpdateUser, { loading }] = useAdminUpdateUser();
  const [adminResetPassword, { loading: resettingPassword }] = useMutation<AdminResetPasswordResponse>(
    ADMIN_RESET_PASSWORD
  );
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleType: 'USER',
    isActive: true,
    isVerified: false,
    isTwoFactorEnabled: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Reset Password Dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Sync form data with user prop
  useEffect(() => {
    if (user && isOpen) {
      const newFormData: FormData = {
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        roleType: user.roleType || 'USER',
        isActive: user.isActive ?? true,
        isVerified: user.isVerified ?? false,
        isTwoFactorEnabled: user.isTwoFactorEnabled ?? false,
      };
      setFormData(newFormData);
      setErrors({});
      setSubmitError(null);
      setHasChanges(false);
    }
  }, [user, isOpen]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await adminUpdateUser({
        variables: {
          id: user.id,
          input: {
            username: formData.username.trim(),
            email: formData.email.trim() || undefined,
            firstName: formData.firstName.trim() || undefined,
            lastName: formData.lastName.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            roleType: formData.roleType,
            isActive: formData.isActive,
            isVerified: formData.isVerified,
            isTwoFactorEnabled: formData.isTwoFactorEnabled,
          },
        },
      });

      if (result.data?.adminUpdateUser) {
        toast({
          title: 'User updated successfully',
          description: `Changes to "${result.data.adminUpdateUser.username}" have been saved.`,
          type: 'success',
        });

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Failed to update user';
      setSubmitError(errorMessage);
      
      toast({
        title: 'Failed to update user',
        description: errorMessage,
        type: 'error',
      });
    }
  }, [user, formData, validateForm, adminUpdateUser, onSuccess, onClose]);

  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleClose = useCallback(() => {
    if (!loading && !resettingPassword) {
      if (hasChanges) {
        const confirmed = confirm('You have unsaved changes. Are you sure you want to close?');
        if (!confirmed) return;
      }
      onClose();
    }
  }, [loading, resettingPassword, hasChanges, onClose]);

  // Handle Reset Password
  const handleResetPassword = useCallback(async () => {
    if (!user) return;

    const confirmed = confirm(
      `Bạn có chắc muốn reset mật khẩu cho user "${user.username}"?\n\nMật khẩu mới sẽ được tạo tự động.`
    );

    if (!confirmed) return;

    try {
      const { data } = await adminResetPassword({
        variables: {
          input: {
            userId: user.id,
          },
        },
      });

      if (data?.adminResetPassword?.success) {
        setNewPassword(data.adminResetPassword.newPassword);
        setShowPasswordDialog(true);

        toast({
          title: 'Reset mật khẩu thành công',
          description: `Mật khẩu mới đã được tạo cho "${user.username}"`,
          type: 'success',
        });
      }
    } catch (err: any) {
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Không thể reset mật khẩu';
      
      toast({
        title: 'Reset mật khẩu thất bại',
        description: errorMessage,
        type: 'error',
      });
    }
  }, [user, adminResetPassword]);

  // Handle Copy Password
  const handleCopyPassword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      
      toast({
        title: 'Đã copy',
        description: 'Mật khẩu đã được copy vào clipboard',
        type: 'success',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể copy mật khẩu',
        type: 'error',
      });
    }
  }, [newPassword]);

  // Handle Close Password Dialog
  const handleClosePasswordDialog = useCallback(() => {
    setShowPasswordDialog(false);
    setNewPassword('');
    setCopied(false);
  }, []);

  if (!isOpen || !user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                <CardTitle>Edit User</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={loading || resettingPassword}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Update information for {user.username}
            </CardDescription>
          </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Alert */}
            {submitError && (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="required">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                    disabled={loading}
                    className={errors.username ? 'border-red-500' : ''}
                    autoFocus
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    disabled={loading}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    disabled={loading}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Role & Permissions
              </h3>
              
              {/* Role Type */}
              <div className="space-y-2">
                <Label htmlFor="roleType">Role Type</Label>
                <Select
                  value={formData.roleType}
                  onValueChange={(value) => handleInputChange('roleType', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="roleType">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="GUEST">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="cursor-pointer">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                      User can log in and access the system
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isVerified" className="cursor-pointer">Verified Status</Label>
                    <p className="text-xs text-muted-foreground">
                      User's email/account has been verified
                    </p>
                  </div>
                  <Switch
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isTwoFactorEnabled" className="cursor-pointer">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Require 2FA for enhanced security
                    </p>
                  </div>
                  <Switch
                    id="isTwoFactorEnabled"
                    checked={formData.isTwoFactorEnabled}
                    onCheckedChange={(checked) => handleInputChange('isTwoFactorEnabled', checked)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Security Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Security Actions
              </h3>
              
              <Alert className="border-amber-200 bg-amber-50">
                <Key className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <div className="space-y-2">
                    <p className="text-amber-800 font-medium">
                      Reset mật khẩu cho nhân viên
                    </p>
                    <p className="text-xs text-amber-700">
                      Hệ thống sẽ tạo mật khẩu ngẫu nhiên mạnh. Bạn có thể copy và gửi cho nhân viên.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                      disabled={loading || resettingPassword}
                      className="w-full sm:w-auto mt-2 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                    >
                      {resettingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang reset...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || resettingPassword}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || resettingPassword || !hasChanges}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    {/* Password Display Dialog */}
    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-green-600" />
            Mật khẩu mới đã được tạo
          </DialogTitle>
          <DialogDescription>
            Copy mật khẩu này và gửi cho nhân viên. Mật khẩu sẽ không hiển thị lại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Password Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                type="text"
                value={newPassword}
                readOnly
                className="pr-12 font-mono text-base sm:text-lg font-semibold bg-gray-50 border-2 border-green-300"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleCopyPassword}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-green-100"
                title="Copy password"
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* User Info */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm space-y-1">
              <p className="font-medium text-blue-900">Thông tin người dùng:</p>
              <div className="text-xs text-blue-800 space-y-0.5">
                <p>• Username: <span className="font-mono font-semibold">{user.username}</span></p>
                {user.email && (
                  <p>• Email: <span className="font-mono">{user.email}</span></p>
                )}
                {user.firstName && user.lastName && (
                  <p>• Họ tên: {user.firstName} {user.lastName}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              <p className="font-medium mb-1">⚠️ Lưu ý quan trọng:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>Mật khẩu này chỉ hiển thị 1 lần duy nhất</li>
                <li>Hãy copy và gửi cho nhân viên ngay</li>
                <li>Nhân viên nên đổi mật khẩu sau lần đăng nhập đầu</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyPassword}
            className="flex-1"
          >
            {copied ? (
              <>
                <CheckCheck className="mr-2 h-4 w-4 text-green-600" />
                Đã copy!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Password
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleClosePasswordDialog}
            className="flex-1"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  UserX, 
  Trash2, 
  Shield, 
  Users,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string, newRole?: string) => Promise<void>;
  onClearSelection?: () => void;
  loading?: boolean;
}

export function BulkActions({ selectedCount, onBulkAction, onClearSelection, loading }: BulkActionsProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const actions = [
    {
      value: 'activate',
      label: 'Activate Users',
      description: 'Enable selected user accounts',
      icon: UserCheck,
      variant: 'default' as const,
      color: 'text-green-600',
    },
    {
      value: 'deactivate',
      label: 'Deactivate Users',
      description: 'Disable selected user accounts',
      icon: UserX,
      variant: 'secondary' as const,
      color: 'text-orange-600',
    },
    {
      value: 'verify',
      label: 'Verify Users',
      description: 'Mark selected users as verified',
      icon: Shield,
      variant: 'default' as const,
      color: 'text-blue-600',
    },
    {
      value: 'changeRole',
      label: 'Change Role',
      description: 'Update role for selected users',
      icon: Users,
      variant: 'default' as const,
      color: 'text-purple-600',
      requiresRole: true,
    },
    {
      value: 'delete',
      label: 'Delete Users',
      description: 'Permanently remove selected users',
      icon: Trash2,
      variant: 'destructive' as const,
      color: 'text-red-600',
      dangerous: true,
    },
  ];

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    const actionConfig = actions.find(a => a.value === action);
    
    // For changeRole, we need role selection first
    if (actionConfig?.requiresRole) {
      // Will show role selector, user clicks "Apply Role" to confirm
      return;
    }
    
    // Show confirmation dialog for all actions
    setShowConfirmDialog(true);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleApplyRole = () => {
    if (!selectedRole) return;
    // Show confirmation before applying role
    setShowConfirmDialog(true);
  };

  const executeAction = async (action: string, role?: string) => {
    try {
      await onBulkAction(action, role);
      setSelectedAction('');
      setSelectedRole('');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
      // Don't close dialog on error so user can retry
    }
  };

  const handleConfirm = () => {
    if (selectedAction === 'changeRole') {
      executeAction(selectedAction, selectedRole);
    } else {
      executeAction(selectedAction);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    // Don't clear selectedAction/selectedRole so user can modify and retry
  };

  const getActionDescription = () => {
    const action = actions.find(a => a.value === selectedAction);
    if (!action) return '';
    
    if (selectedAction === 'changeRole' && selectedRole) {
      return `Are you sure you want to change the role to ${selectedRole.toUpperCase()} for ${selectedCount} selected user${selectedCount > 1 ? 's' : ''}?`;
    }
    
    if (selectedAction === 'delete') {
      return `Are you sure you want to permanently delete ${selectedCount} selected user${selectedCount > 1 ? 's' : ''}?`;
    }
    
    if (selectedAction === 'activate') {
      return `Are you sure you want to activate ${selectedCount} selected user${selectedCount > 1 ? 's' : ''}?`;
    }
    
    if (selectedAction === 'deactivate') {
      return `Are you sure you want to deactivate ${selectedCount} selected user${selectedCount > 1 ? 's' : ''}?`;
    }
    
    if (selectedAction === 'verify') {
      return `Are you sure you want to verify ${selectedCount} selected user${selectedCount > 1 ? 's' : ''}?`;
    }
    
    return `${action.description} (${selectedCount} user${selectedCount > 1 ? 's' : ''})`;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-gray-600">Bulk Actions:</span>
            {onClearSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={loading}
                className="h-7 text-xs"
              >
                Clear Selection
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Role Selection for Change Role Action */}
            {selectedAction === 'changeRole' && (
              <>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleApplyRole}
                  disabled={loading || !selectedRole}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Users className="w-4 h-4 mr-1" />
                  )}
                  Apply Role
                </Button>
              </>
            )}

            {/* Action Buttons - Hide changeRole button when it's selected (role selector shown instead) */}
            {actions
              .filter(action => !(selectedAction === 'changeRole' && action.value === 'changeRole'))
              .map((action) => {
                const Icon = action.icon;
                const isSelected = selectedAction === action.value;
                const isDisabled = loading;

                return (
                  <Button
                    key={action.value}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleActionClick(action.value)}
                    disabled={isDisabled}
                    className={isSelected ? 'ring-2 ring-offset-2' : ''}
                  >
                    {loading && selectedAction === action.value ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Icon className="w-4 h-4 mr-1" />
                    )}
                    {action.label}
                  </Button>
                );
              })}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {/* <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription()}
                {selectedAction === 'delete' && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                    <strong className="text-red-800">⚠️ Warning:</strong>
                    <p className="text-red-700 text-sm mt-1">This action cannot be undone. All selected user data will be permanently deleted.</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel} disabled={loading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={loading}
                className={selectedAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}
      </CardContent>
    </Card>
  );
}
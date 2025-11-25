'use client';

import React, { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useDeleteProject,
  usePermanentlyDeleteProject,
  useRestoreProject,
} from '@/hooks/useProjects.dynamic';
import {
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteProjectMenuProps {
  project: {
    id: string;
    name: string;
    isArchived?: boolean;
  };
  onDelete?: () => void;
  className?: string;
}

export function DeleteProjectMenu({
  project,
  onDelete,
  className,
}: DeleteProjectMenuProps) {
  const { toast } = useToast();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const [deleteProject, { loading: archiving }] = useDeleteProject();
  const [permanentlyDelete, { loading: deleting }] = usePermanentlyDeleteProject();
  const [restoreProject, { loading: restoring }] = useRestoreProject();

  const handleArchive = async () => {
    try {
      await deleteProject({
        variables: { id: project.id },
      });

      toast({
        title: '✅ Đã lưu trữ',
        description: `Dự án "${project.name}" đã được lưu trữ`,
        type: 'success',
      });

      setShowArchiveDialog(false);
      onDelete?.();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể lưu trữ dự án',
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async () => {
    if (confirmText !== project.name) {
      toast({
        title: '⚠️ Xác nhận không đúng',
        description: 'Vui lòng nhập chính xác tên dự án',
        type: 'error',
        variant: 'destructive',
      });
      return;
    }

    try {
      await permanentlyDelete({
        variables: { id: project.id },
      });

      toast({
        title: '✅ Đã xóa vĩnh viễn',
        description: `Dự án "${project.name}" và tất cả dữ liệu đã bị xóa`,
        type: 'success',
      });

      setShowDeleteDialog(false);
      setConfirmText('');
      onDelete?.();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể xóa dự án',
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async () => {
    try {
      await restoreProject({
        variables: { id: project.id },
      });

      toast({
        title: '✅ Đã khôi phục',
        description: `Dự án "${project.name}" đã được khôi phục`,
        type: 'success',
      });

      setShowRestoreDialog(false);
      onDelete?.();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể khôi phục dự án',
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', className)}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!project.isArchived ? (
            <>
              <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                <Archive className="mr-2 h-4 w-4" />
                Lưu trữ dự án
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa vĩnh viễn
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setShowRestoreDialog(true)}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Khôi phục dự án
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa vĩnh viễn
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Lưu trữ dự án?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Dự án <span className="font-semibold">"{project.name}"</span> sẽ được lưu trữ.
              </p>
              <p className="text-sm">
                ✅ Dữ liệu được giữ nguyên
                <br />
                ✅ Có thể khôi phục bất kỳ lúc nào
                <br />
                ⚠️ Dự án sẽ bị ẩn khỏi danh sách
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleArchive();
              }}
              disabled={archiving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {archiving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Lưu trữ
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArchiveRestore className="h-5 w-5" />
              Khôi phục dự án?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Dự án <span className="font-semibold">"{project.name}"</span> sẽ được khôi phục và hiển thị trở lại trong danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRestore();
              }}
              disabled={restoring}
              className="bg-green-600 hover:bg-green-700"
            >
              {restoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang khôi phục...
                </>
              ) : (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Khôi phục
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Xóa vĩnh viễn dự án?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold text-destructive">
                  ⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ KHÔI PHỤC!
                </p>
                <p>
                  Dự án <span className="font-semibold">"{project.name}"</span> cùng TẤT CẢ dữ liệu liên quan sẽ bị xóa vĩnh viễn:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>❌ Tất cả tasks</li>
                  <li>❌ Tất cả tin nhắn chat</li>
                  <li>❌ Tất cả thành viên</li>
                  <li>❌ Tất cả file đính kèm</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="confirm-delete" className="text-sm font-medium">
                  Nhập <span className="font-mono bg-muted px-1 rounded">{project.name}</span> để xác nhận:
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Nhập tên dự án"
                  className="font-mono"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              onClick={() => setConfirmText('')}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handlePermanentDelete();
              }}
              disabled={deleting || confirmText !== project.name}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa vĩnh viễn
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import { PageBlock } from '@/types/page-builder';
import { BlockRenderer } from './BlockRenderer';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';

interface SortableBlockWrapperProps {
  block: PageBlock;
  isEditing: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
  onCopy?: (block: PageBlock) => void;
  onAddChild?: (parentId: string) => void;
  onUpdateChild?: (blockId: string, content: any, style?: any) => void;
  onDeleteChild?: (blockId: string) => void;
  onSelect?: (blockId: string | null) => void;
  depth?: number;
}

export function SortableBlockWrapper({
  block,
  isEditing,
  onUpdate,
  onDelete,
  onCopy,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onSelect,
  depth = 0,
}: SortableBlockWrapperProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: {
      type: 'existing-block',
      block,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle copy block
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(block);
      toast.success('Block đã được sao chép');
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
    toast.success('Block đã được xóa');
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} data-block-id={block.id}>
        <div className={`relative group rounded-lg transition-all duration-200 ${
          isDragging 
            ? 'ring-4 ring-blue-400 shadow-2xl scale-102' 
            : 'hover:ring-2 hover:ring-gray-300'
        }`}>
          {/* Block Order Number Badge */}
          {isEditing && (
            <div className="absolute -top-2 -left-2 z-20">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                isDragging 
                  ? 'bg-blue-500 text-white scale-110' 
                  : 'bg-gray-700 text-white group-hover:bg-blue-600'
              }`}>
                {block.order + 1}
              </div>
            </div>
          )}

          {/* Drag Handle + Control Buttons - Only visible in edit mode */}
          {isEditing && (
            <div className="absolute -left-8 top-4 flex flex-col gap-1 z-10">
              {/* Drag Handle */}
              <div
                {...listeners}
                className={`w-8 h-8 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing rounded-md shadow-sm ${
                  isDragging
                    ? 'opacity-100 bg-blue-500 border border-blue-600'
                    : 'opacity-0 group-hover:opacity-100 bg-white border border-gray-300 hover:bg-blue-50'
                }`}
                title="Kéo để sắp xếp"
              >
                <GripVertical className={`w-4 h-4 transition-colors ${
                  isDragging ? 'text-white' : 'text-gray-500'
                }`} />
              </div>

              {/* Copy Button */}
              {onCopy && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className={`w-8 h-8 transition-all shadow-sm ${
                    isDragging
                      ? 'opacity-0'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-green-50 hover:border-green-300'
                  }`}
                  title="Sao chép block"
                >
                  <Copy className="w-4 h-4 text-green-600" />
                </Button>
              )}

              {/* Delete Button */}
              <Button
                size="icon"
                variant="outline"
                onClick={handleDeleteClick}
                className={`w-8 h-8 transition-all shadow-sm ${
                  isDragging
                    ? 'opacity-0'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300'
                }`}
                title="Xóa block"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}

          {/* Drag Indicator */}
          {isDragging && (
            <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce z-20">
              ⬆️ Đang di chuyển
            </div>
          )}

          {/* Block Content */}
          <BlockRenderer
            block={block}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onUpdateChild={onUpdateChild}
            onDeleteChild={onDeleteChild}
            onSelect={onSelect}
            depth={depth}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Xác nhận xóa Block
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa block này không? 
              <br />
              <span className="font-semibold text-gray-900 mt-2 block">
                Block type: {block.type}
              </span>
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ Hành động này không thể hoàn tác!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

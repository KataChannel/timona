'use client';

/**
 * Enhanced Sortable Block Wrapper
 * Mobile-optimized with touch support
 */

import React, { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';

interface EnhancedSortableBlockProps {
  id: string;
  children: ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  disabled?: boolean;
}

export default function EnhancedSortableBlock({
  id,
  children,
  isSelected = false,
  onClick,
  onDelete,
  onDuplicate,
  disabled = false,
}: EnhancedSortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`
        group relative
        bg-white rounded-lg
        border-2 transition-all
        ${isSelected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
      `}
    >
      {/* Drag handle - mobile optimized */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all touch-manipulation z-10"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-gray-600" />
        </div>
      )}

      {/* Action buttons - mobile optimized */}
      {!disabled && (
        <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all touch-manipulation"
              aria-label="Duplicate block"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all touch-manipulation"
              aria-label="Delete block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Block content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { BlockRenderer } from './blocks/BlockRenderer';
import { PageBlock } from '@/types/page-builder';

interface SortableBlockProps {
  block: PageBlock;
  onUpdate: (blockId: string, content: any, style?: any) => void;
  onDelete: (blockId: string) => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = (content: any, style?: any) => {
    onUpdate(block.id, content, style);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this block?')) {
      onDelete(block.id);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative group border-l-4 ${
        isDragging ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400'
      } transition-colors duration-200`}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-2">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="text-gray-500" />
          </button>
          
          <span className="text-sm font-medium text-gray-700 capitalize">
            {block.type.toLowerCase()} Block
          </span>
        </div>

        {/* Block Actions */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8 p-0"
            title={isEditing ? 'Stop Editing' : 'Edit Block'}
          >
            <Edit size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 w-8 p-0"
            title={showPreview ? 'Hide Preview' : 'Show Preview'}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete Block"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-4">
        <BlockRenderer
          block={block}
          isEditing={showPreview ? false : isEditing}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>

      {/* Drag Overlay Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center">
          <div className="text-blue-600 font-medium">Moving block...</div>
        </div>
      )}
    </Card>
  );
};
import React from 'react';
import { Trash2 } from 'lucide-react';
import { PageBlock } from '@/types/page-builder';

interface SpacerBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  isEditable = false,
  onDelete,
}) => {
  const content = block.content || {};
  const height = content.height || 40;

  return (
    <div
      className={`relative group ${isEditable ? 'hover:ring-2 hover:ring-blue-300 hover:bg-gray-50' : ''}`}
      style={{ 
        height: `${height}px`,
        ...block.style 
      }}
    >
      {isEditable && (
        <>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
              Spacer ({height}px)
            </span>
          </div>
          <button
            onClick={onDelete}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  );
};
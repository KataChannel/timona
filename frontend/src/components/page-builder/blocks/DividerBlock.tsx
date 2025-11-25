import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { PageBlock } from '@/types/page-builder';

interface DividerBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  isEditable = false,
  onDelete,
}) => {
  const content = block.content || {};

  return (
    <div
      className={`relative group ${isEditable ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
      style={block.style}
    >
      <hr 
        className="border-gray-300"
        style={{
          borderColor: content.color || '#d1d5db',
          borderWidth: content.width || 1,
          borderStyle: content.style || 'solid',
        }}
      />
      
      {isEditable && (
        <div className="absolute top-0 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDelete}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
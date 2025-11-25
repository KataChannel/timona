import React, { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { PageBlock, ButtonBlockContent } from '@/types/page-builder';

interface ButtonBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<ButtonBlockContent>(block.content);

  const handleSave = () => {
    onUpdate?.(content, block.style);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  if (isEditing && isEditable) {
    return (
      <div className="relative border-2 border-blue-500 rounded-lg p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input
              type="text"
              value={content.text || ''}
              onChange={(e) => setContent(prev => ({ ...prev, text: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Click me"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input
              type="text"
              value={content.link || ''}
              onChange={(e) => setContent(prev => ({ ...prev, link: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="/contact or https://example.com"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Variant</label>
              <select
                value={content.variant || 'primary'}
                onChange={(e) => setContent(prev => ({ ...prev, variant: e.target.value as any }))}
                className="w-full p-1 border rounded text-sm"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Size</label>
              <select
                value={content.size || 'md'}
                onChange={(e) => setContent(prev => ({ ...prev, size: e.target.value as any }))}
                className="w-full p-1 border rounded text-sm"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={content.fullWidth || false}
                  onChange={(e) => setContent(prev => ({ ...prev, fullWidth: e.target.checked }))}
                  className="mr-1"
                />
                Full Width
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-block font-semibold rounded transition-colors text-center';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
    };
    
    const sizeClasses = {
      sm: 'py-1 px-3 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg'
    };
    
    const widthClass = content.fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${variantClasses[content.variant || 'primary']} ${sizeClasses[content.size || 'md']} ${widthClass}`.trim();
  };

  return (
    <div
      className={`relative group text-center ${isEditable ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
      style={block.style}
    >
      <a
        href={content.link || '#'}
        className={getButtonClasses()}
      >
        {content.text || 'Button'}
      </a>
      
      {isEditable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Edit"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
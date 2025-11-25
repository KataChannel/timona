'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, X } from 'lucide-react';
import { PageBlock, TextBlockContent } from '@/types/page-builder';
import { RichTextEditor } from './RichTextEditor';

interface TextBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [html, setHtml] = useState<string>(block.content?.html || '');
  const content: TextBlockContent = block.content || { html: '', text: '' };

  const handleSave = () => {
    // Extract plain text from HTML for backward compatibility
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    onUpdate?.(
      {
        ...content,
        html,
        text: plainText,
      },
      block.style
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setHtml(block.content?.html || '');
    setIsEditing(false);
  };

  if (isEditing && isEditable) {
    return (
      <div className="relative border-2 border-blue-500 rounded-lg p-4 bg-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Edit Text Block</h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
              title="Close editor"
            >
              <X size={20} />
            </button>
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            value={html}
            onChange={setHtml}
            placeholder="Enter your rich text content here..."
            editable={true}
            showToolbar={true}
            className="min-h-80"
          />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group ${isEditable ? 'hover:ring-2 hover:ring-blue-300 rounded-md' : ''}`}
      style={block.style}
    >
      {/* Content Display */}
      <div
        className="prose prose-sm max-w-none"
        style={{
          fontSize: content.fontSize || 16,
          fontWeight: content.fontWeight || 'normal',
          textAlign: content.textAlign || 'left',
          color: content.color || 'inherit',
          lineHeight: content.lineHeight || 1.5,
          letterSpacing: content.letterSpacing || 0,
        }}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="text-gray-400">Click to edit text...</div>
        )}
      </div>

      {/* Edit Controls */}
      {isEditable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1 bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
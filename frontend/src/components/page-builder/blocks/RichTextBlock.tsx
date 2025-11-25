'use client';

/**
 * Enhanced RichTextBlock with BlockNote-style Editor
 * Mobile-first, PWA-ready, Dynamic GraphQL integrated
 */

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { Type, Settings } from 'lucide-react';
import { PageBlock } from '@/types/page-builder';

// Dynamic import để tối ưu performance
const BlockNoteEditor = dynamic(
  () => import('../editors/BlockNoteEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <Type className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    ),
  }
);

export interface RichTextBlockData {
  content: string;
  minHeight?: string;
  placeholder?: string;
  // Styling options
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: string;
  maxWidth?: string;
}

interface RichTextBlockProps {
  // Support both block prop (from BlockRenderer) and data prop (from EnhancedPageBuilder)
  block?: PageBlock;
  data?: RichTextBlockData;
  isEditMode?: boolean;
  isEditable?: boolean;
  onChange?: (data: RichTextBlockData) => void;
  onUpdate?: (content: any, style?: any) => void;
  onSettingsClick?: () => void;
  onDelete?: () => void;
}

const RichTextBlock = memo(({
  block,
  data,
  isEditMode = false,
  isEditable = false,
  onChange,
  onUpdate,
  onSettingsClick,
  onDelete,
}: RichTextBlockProps) => {
  // Determine if we're in edit mode
  const inEditMode = isEditMode || isEditable;
  
  // Get content from either block.content or data
  const blockContent = block?.content || data || {};
  
  // Ensure data has all required properties with defaults
  const blockData: RichTextBlockData = {
    ...defaultRichTextData,
    ...blockContent,
  };

  const handleContentChange = (content: string) => {
    const updatedData = { ...blockData, content };
    
    // Call appropriate callback
    if (onChange) {
      onChange(updatedData);
    } else if (onUpdate) {
      onUpdate(updatedData, block?.style);
    }
  };

  // Render view mode
  if (!inEditMode) {
    return (
      <div 
        className="rich-text-block-view"
        style={{
          backgroundColor: blockData.backgroundColor,
          color: blockData.textColor,
          padding: blockData.padding,
          borderRadius: blockData.borderRadius,
          maxWidth: blockData.maxWidth,
        }}
      >
        <div 
          className="prose prose-sm md:prose-base max-w-none"
          dangerouslySetInnerHTML={{ __html: blockData.content || '<p>No content</p>' }}
        />
      </div>
    );
  }

  // Render edit mode
  return (
    <div className="rich-text-block-edit relative group">
      {/* Settings button - mobile friendly */}
      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="absolute -top-2 -right-2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
          aria-label="Rich text settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Editor with visible border and background */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors">
        <BlockNoteEditor
          content={blockData.content}
          onChange={handleContentChange}
          placeholder={blockData.placeholder}
          editable={true}
          minHeight={blockData.minHeight}
          className="shadow-sm"
        />
      </div>
    </div>
  );
});

RichTextBlock.displayName = 'RichTextBlock';

// Default data for new blocks
export const defaultRichTextData: RichTextBlockData = {
  content: '',
  minHeight: '200px',
  placeholder: 'Start typing your content here...',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  padding: '1rem',
  borderRadius: '0.5rem',
  maxWidth: '100%',
};

export default RichTextBlock;

import React from 'react';
import { PageBlock } from '@/types/page-builder';

interface VideoBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded text-center">
      <p className="text-gray-600">Video Block - Coming Soon</p>
    </div>
  );
};
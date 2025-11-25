import React, { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { PageBlock, HeroBlockContent } from '@/types/page-builder';

interface HeroBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<HeroBlockContent>(block.content);

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
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Hero title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Hero subtitle..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={content.description || ''}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded resize-none"
              rows={3}
              placeholder="Hero description..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input
                type="text"
                value={content.buttonText || ''}
                onChange={(e) => setContent(prev => ({ ...prev, buttonText: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Get Started"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Button Link</label>
              <input
                type="url"
                value={content.buttonLink || ''}
                onChange={(e) => setContent(prev => ({ ...prev, buttonLink: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="/contact"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Background Image URL</label>
            <input
              type="url"
              value={content.backgroundImage || ''}
              onChange={(e) => setContent(prev => ({ ...prev, backgroundImage: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="https://example.com/hero-bg.jpg"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <input
                type="color"
                value={content.backgroundColor || '#000000'}
                onChange={(e) => setContent(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-full h-10 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Text Align</label>
              <select
                value={content.textAlign || 'center'}
                onChange={(e) => setContent(prev => ({ ...prev, textAlign: e.target.value as any }))}
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={content.overlay || false}
                onChange={(e) => setContent(prev => ({ ...prev, overlay: e.target.checked }))}
                className="mr-2"
              />
              Dark Overlay
            </label>
            
            {content.overlay && (
              <div className="flex items-center gap-2">
                <label className="text-sm">Opacity:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={content.overlayOpacity || 50}
                  onChange={(e) => setContent(prev => ({ ...prev, overlayOpacity: parseInt(e.target.value) }))}
                  className="w-20"
                />
                <span className="text-sm">{content.overlayOpacity || 50}%</span>
              </div>
            )}
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

  const backgroundStyle = {
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    backgroundColor: content.backgroundColor || '#1f2937',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const overlayStyle = content.overlay ? {
    backgroundColor: `rgba(0, 0, 0, ${(content.overlayOpacity || 50) / 100})`,
  } : {};

  return (
    <div
      className={`relative group ${isEditable ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
      style={block.style}
    >
      <div
        className="relative min-h-[400px] flex items-center justify-center text-white"
        style={backgroundStyle}
      >
        {content.overlay && (
          <div
            className="absolute inset-0"
            style={overlayStyle}
          />
        )}
        
        <div 
          className={`relative z-10 max-w-4xl mx-auto px-6 text-${content.textAlign || 'center'}`}
        >
          {content.title && (
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {content.title}
            </h1>
          )}
          
          {content.subtitle && (
            <h2 className="text-xl md:text-2xl font-semibold mb-6 opacity-90">
              {content.subtitle}
            </h2>
          )}
          
          {content.description && (
            <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
          
          {content.buttonText && (
            <a
              href={content.buttonLink || '#'}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {content.buttonText}
            </a>
          )}
        </div>
      </div>
      
      {isEditable && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
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
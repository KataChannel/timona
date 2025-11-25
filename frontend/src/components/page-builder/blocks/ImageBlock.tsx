import React, { useState } from 'react';
import { Edit3, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { PageBlock, ImageBlockContent } from '@/types/page-builder';
import { FilePicker } from '@/components/file-manager/FilePicker';
import { File as FileType, FileType as FileTypeEnum } from '@/types/file';
import { Button } from '@/components/ui/button';

interface ImageBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<ImageBlockContent>(block.content);
  const [isUploading, setIsUploading] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const handleSave = () => {
    onUpdate?.(content, block.style);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  const handleFileSelection = (fileOrUrl: FileType | string) => {
    if (typeof fileOrUrl === 'string') {
      // URL input
      setContent(prev => ({ ...prev, src: fileOrUrl }));
    } else {
      // File from MinIO
      setContent(prev => ({ ...prev, src: fileOrUrl.url, alt: fileOrUrl.originalName }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setContent(prev => ({ ...prev, src: base64String }));
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Lỗi khi đọc file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi khi upload hình ảnh');
      setIsUploading(false);
    }
  };

  if (isEditing && isEditable) {
    return (
      <div className="relative border-2 border-blue-500 rounded-lg p-4">
        <div className="space-y-4">
          {/* File Picker Button */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Chọn Hình Ảnh</label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilePicker(true)}
              className="w-full"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Chọn từ thư viện hoặc nhập URL
            </Button>
            {content.src && (
              <div className="mt-2">
                <img 
                  src={content.src} 
                  alt="Preview" 
                  className="max-w-full h-32 object-contain rounded border"
                />
              </div>
            )}
          </div>

          {/* Direct URL Input (Alternative) */}
          <div>
            <label className="block text-sm font-medium mb-1">Hoặc nhập trực tiếp URL hình ảnh</label>
            <input
              type="url"
              value={content.src || ''}
              onChange={(e) => setContent(prev => ({ ...prev, src: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text</label>
            <input
              type="text"
              value={content.alt || ''}
              onChange={(e) => setContent(prev => ({ ...prev, alt: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Mô tả hình ảnh..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Caption (Tùy chọn)</label>
            <input
              type="text"
              value={content.caption || ''}
              onChange={(e) => setContent(prev => ({ ...prev, caption: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Chú thích hình ảnh..."
            />
          </div>
          
          {/* Dimension Controls */}
          <div>
            <label className="block text-sm font-medium mb-2">Kích Thước Hình Ảnh</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chiều rộng (px)</label>
                <input
                  type="number"
                  value={content.width || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, width: parseInt(e.target.value) || undefined }))}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Auto"
                  min="1"
                  max="2000"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chiều cao (px)</label>
                <input
                  type="number"
                  value={content.height || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Auto"
                  min="1"
                  max="2000"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Object Fit</label>
                <select
                  value={content.objectFit || 'cover'}
                  onChange={(e) => setContent(prev => ({ ...prev, objectFit: e.target.value as any }))}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </div>
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

  if (!content.src) {
    return (
      <div 
        className={`relative group border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${
          isEditable ? 'hover:ring-2 hover:ring-blue-300 cursor-pointer' : ''
        }`}
        onClick={() => isEditable && setIsEditing(true)}
      >
        <Upload className="mx-auto mb-2 text-gray-400" size={48} />
        <p className="text-gray-500">Click to add an image</p>
        
        {isEditable && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative group ${isEditable ? 'hover:ring-2 hover:ring-blue-300' : ''}`}>
      <div className="w-full">
        <img
          src={content.src}
          alt={content.alt || ''}
          style={{
            width: content.width ? `${content.width}px` : '100%',
            height: content.height ? `${content.height}px` : 'auto',
            objectFit: content.objectFit || 'cover',
            maxWidth: '100%',
          }}
          className="rounded-lg"
        />
        {content.caption && (
          <p className="mt-2 text-sm text-gray-600 italic">{content.caption}</p>
        )}
      </div>
      
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

      {/* FilePicker Modal */}
      <FilePicker
        open={showFilePicker}
        onOpenChange={setShowFilePicker}
        onSelect={handleFileSelection}
        fileTypes={[FileTypeEnum.IMAGE]}
        allowUrl={true}
      />
    </div>
  );
};
'use client';

import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  icon?: string;
}

export interface BookmarkBlockContent {
  bookmarks?: BookmarkItem[];
  displayMode?: 'list' | 'grid';
  showCategories?: boolean;
  allowEdit?: boolean;
  style?: any;
}

export interface BookmarkBlockProps {
  block?: any;
  content: BookmarkBlockContent;
  style?: any;
  isEditable?: boolean;
  onUpdate?: (content: BookmarkBlockContent, style?: any) => void;
  onDelete?: () => void;
}

export const BookmarkBlock: React.FC<BookmarkBlockProps> = ({
  content = {},
  style = {},
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(content.bookmarks || []);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    displayMode = 'list',
    showCategories = true,
    allowEdit = true,
  } = content;

  const handleAddBookmark = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newBookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl,
      category: 'General',
    };

    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    setNewTitle('');
    setNewUrl('');

    if (onUpdate) {
      onUpdate({ ...content, bookmarks: updated });
    }
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);

    if (onUpdate) {
      onUpdate({ ...content, bookmarks: updated });
    }
  };

  const handleContentChange = (field: string, value: any) => {
    if (isEditable && onUpdate) {
      onUpdate({
        ...content,
        [field]: value,
      });
    }
  };

  const groupedBookmarks = showCategories
    ? bookmarks.reduce((acc, bookmark) => {
        const category = bookmark.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(bookmark);
        return acc;
      }, {} as Record<string, BookmarkItem[]>)
    : { All: bookmarks };

  return (
    <div
      className="w-full p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg"
      style={style}
    >
      {isEditable && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-dashed border-amber-300 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Add New Bookmark</h4>
            <Input
              placeholder="Bookmark Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              placeholder="URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <Button
              onClick={handleAddBookmark}
              className="w-full gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Bookmark
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Mode
            </label>
            <select
              value={displayMode}
              onChange={(e) => handleContentChange('displayMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="list">List View</option>
              <option value="grid">Grid View</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCategories}
              onChange={(e) => handleContentChange('showCategories', e.target.checked)}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Show Categories
            </label>
          </div>

          {onDelete && (
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Delete Block
            </Button>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6" />
            My Bookmarks
          </h2>
        </div>

        {Object.keys(groupedBookmarks).length === 0 ? (
          <div className="p-8 bg-white rounded-lg border-2 border-dashed border-amber-300 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-amber-400 mb-4 opacity-50" />
            <p className="text-gray-600">No bookmarks yet. Add your first bookmark!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBookmarks).map(([category, items]) => (
              <div key={category}>
                {showCategories && (
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-300">
                    {category}
                  </h3>
                )}

                <div
                  className={
                    displayMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-3'
                  }
                >
                  {items.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition ${
                        displayMode === 'grid' ? 'flex flex-col' : 'flex items-center justify-between'
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                          <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                            {bookmark.title}
                          </a>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">{bookmark.url}</p>
                      </div>

                      {isEditable && allowEdit && (
                        <div className="flex gap-2 mt-2 md:mt-0 md:ml-2">
                          <Button
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkBlock;

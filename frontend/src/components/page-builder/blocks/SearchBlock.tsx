'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchBlockContent {
  placeholder?: string;
  searchType?: 'global' | 'pages' | 'products';
  showFilters?: boolean;
  showResults?: boolean;
  style?: any;
}

export interface SearchBlockProps {
  block?: any;
  content: SearchBlockContent;
  style?: any;
  isEditable?: boolean;
  onUpdate?: (content: SearchBlockContent, style?: any) => void;
  onDelete?: () => void;
}

export const SearchBlock: React.FC<SearchBlockProps> = ({
  content = {},
  style = {},
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const {
    placeholder = 'Tìm kiếm...',
    searchType = 'global',
    showFilters = true,
  } = content;

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setShowResults(false);
      return;
    }

    // Mock search results
    setResults([
      { id: 1, title: 'Result 1', description: 'Description for result 1' },
      { id: 2, title: 'Result 2', description: 'Description for result 2' },
      { id: 3, title: 'Result 3', description: 'Description for result 3' },
    ]);
    setShowResults(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  return (
    <div
      className="w-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg"
      style={style}
    >
      {isEditable && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-dashed border-blue-300 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder Text
            </label>
            <Input
              value={placeholder}
              onChange={(e) => handleContentChange('placeholder', e.target.value)}
              placeholder="Enter placeholder text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => handleContentChange('searchType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="global">Global Search</option>
              <option value="pages">Pages Only</option>
              <option value="products">Products Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFilters}
              onChange={(e) => handleContentChange('showFilters', e.target.checked)}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Show Filters
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

      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button
            onClick={handleSearch}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:border-blue-500 transition">
              Filter 1
            </button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:border-blue-500 transition">
              Filter 2
            </button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:border-blue-500 transition">
              Filter 3
            </button>
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-gray-600">
              Found {results.length} results
            </p>
            {results.map((result) => (
              <div
                key={result.id}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer"
              >
                <h3 className="font-medium text-gray-900">{result.title}</h3>
                <p className="text-sm text-gray-600">{result.description}</p>
              </div>
            ))}
          </div>
        )}

        {showResults && searchQuery && results.length === 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBlock;

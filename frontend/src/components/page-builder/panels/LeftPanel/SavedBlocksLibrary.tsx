/**
 * SavedBlocksLibrary Component
 * Manages user-saved block combinations for quick reuse
 * Features: search, filter, export/import, double-click apply
 * 
 * Refactored to use shared hooks:
 * - useFilteredAndGrouped: Filtering and grouping logic
 * - useCategoryToggle: Category expansion state
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Calendar,
  Download,
  Upload,
  ChevronDown,
  Package,
  Zap,
} from 'lucide-react';
import { usePageState, usePageActions } from '@/components/page-builder/PageBuilderProvider';
import { useFilteredAndGrouped } from '@/components/page-builder/hooks/useFilteredAndGrouped';
import { useCategoryToggle } from '@/components/page-builder/hooks/useCategoryToggle';
import { LibraryCard } from '@/components/page-builder/components/LibraryCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { pageBuilderLogger, LOG_OPERATIONS } from '@/components/page-builder/utils/pageBuilderLogger';

interface SavedBlock {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  blocks: any[]; // Block data structure
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  popularity?: 'hot' | 'new' | null;
  isBookmarked?: boolean; // NEW: bookmark flag
}

const SAVED_BLOCKS_KEY = 'kata_saved_blocks';

export function SavedBlocksLibrary() {
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { blocks } = usePageState();
  const { handleAddBlock } = usePageActions();

  // Load saved blocks from localStorage
  useEffect(() => {
    loadSavedBlocks();
  }, []);

  const loadSavedBlocks = () => {
    try {
      const stored = localStorage.getItem(SAVED_BLOCKS_KEY);
      if (stored) {
        setSavedBlocks(JSON.parse(stored));
      }
    } catch (error) {
      pageBuilderLogger.error('SAVED_BLOCKS_LOAD', 'Error loading saved blocks', { error });
      toast.error('Failed to load saved blocks');
    }
  };

  const saveSavedBlocks = (blocks: SavedBlock[]) => {
    try {
      localStorage.setItem(SAVED_BLOCKS_KEY, JSON.stringify(blocks));
      setSavedBlocks(blocks);
    } catch (error) {
      pageBuilderLogger.error('SAVED_BLOCKS_SAVE', 'Error saving blocks', { error });
      toast.error('Failed to save blocks');
    }
  };

  const saveCurrentSelection = () => {
    if (blocks.length === 0) {
      toast.error('No blocks to save. Add some blocks to your page first.');
      return;
    }

    const name = prompt('Enter a name for this saved block combination:');
    if (!name) return;

    const description = prompt('Enter a description (optional):') || '';

    const newSavedBlock: SavedBlock = {
      id: `saved-${Date.now()}`,
      name,
      description,
      blocks: [...blocks],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'custom',
      tags: [],
      popularity: 'new' as const,
    };

    const updated = [...savedBlocks, newSavedBlock];
    saveSavedBlocks(updated);
    toast.success(`"${name}" saved successfully!`);
  };

  const applySavedBlock = async (savedBlock: SavedBlock) => {
    try {
      // Apply each block from the saved combination
      for (const block of savedBlock.blocks) {
        await handleAddBlock(block.type);
      }
      toast.success(`Applied "${savedBlock.name}" to page`);
    } catch (error: any) {
      pageBuilderLogger.error('SAVED_BLOCK_APPLY', 'Error applying saved block', { blockId: savedBlock.id, error });
      toast.error('Failed to apply saved block');
    }
  };

  const duplicateSavedBlock = (savedBlock: SavedBlock) => {
    const duplicate: SavedBlock = {
      ...savedBlock,
      id: `saved-${Date.now()}`,
      name: `${savedBlock.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      popularity: null,
    };

    const updated = [...savedBlocks, duplicate];
    saveSavedBlocks(updated);
    toast.success('Block duplicated');
  };

  const deleteSavedBlock = (id: string) => {
    if (confirm('Delete this saved block? This cannot be undone.')) {
      const updated = savedBlocks.filter(b => b.id !== id);
      saveSavedBlocks(updated);
      toast.success('Block deleted');
    }
  };

  const toggleBookmarkBlock = (id: string) => {
    const updated = savedBlocks.map(b => 
      b.id === id ? { ...b, isBookmarked: !b.isBookmarked } : b
    );
    saveSavedBlocks(updated);
    
    const block = savedBlocks.find(b => b.id === id);
    if (block?.isBookmarked) {
      toast.success('Bookmark removed');
    } else {
      toast.success('Block bookmarked!');
    }
  };

  const exportSavedBlocks = () => {
    if (savedBlocks.length === 0) {
      toast.error('No saved blocks to export');
      return;
    }

    const dataStr = JSON.stringify(savedBlocks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `saved-blocks-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Blocks exported');
  };

  const importSavedBlocks = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            const updated = [...savedBlocks, ...imported];
            saveSavedBlocks(updated);
            toast.success(`Imported ${imported.length} blocks`);
          } catch (error) {
            toast.error('Invalid file format. Please check the file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Use shared hooks for filtering, grouping, and category toggle
  const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryToggle({
    initialState: { 'custom': true },
  });

  const { groupedItems: groupedBlocks, isEmpty } = useFilteredAndGrouped(
    savedBlocks,
    searchQuery,
    {
      searchFields: ['name', 'description', 'tags'],
      groupByField: 'category',
    }
  );

  const categories = Object.keys(groupedBlocks);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-white space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h2 className="font-semibold text-sm sm:text-base">Saved Blocks</h2>
            <Badge variant="secondary" className="ml-1 text-[10px] sm:text-xs">
              {savedBlocks.length}
            </Badge>
          </div>
          
          <div className="flex gap-1 sm:gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={exportSavedBlocks}
              disabled={savedBlocks.length === 0}
              className="h-7 sm:h-8 w-7 sm:w-8 p-0 flex-shrink-0"
              title="Export blocks"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={importSavedBlocks}
              className="h-7 sm:h-8 w-7 sm:w-8 p-0 flex-shrink-0"
              title="Import blocks"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              onClick={saveCurrentSelection}
              disabled={blocks.length === 0}
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs gap-1 flex-shrink-0"
              title="Save current page blocks"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search blocks or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Saved Blocks Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {savedBlocks.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center text-gray-400 text-xs sm:text-sm py-8 sm:py-12">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" />
            <p className="font-medium text-gray-600">No saved blocks yet</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center">
              Create block combinations and save them for quick reuse
            </p>
            <Button
              onClick={saveCurrentSelection}
              disabled={blocks.length === 0}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 mt-3 sm:mt-4"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Save Current Selection
            </Button>
          </div>
        ) : isEmpty ? (
          // No Results
          <div className="flex flex-col items-center justify-center text-gray-400 text-xs sm:text-sm py-8 sm:py-12">
            <Search className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" />
            <p className="font-medium text-gray-600">No blocks found</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Try a different search term</p>
          </div>
        ) : (
          // Category Groups
          <div className="space-y-4 sm:space-y-6">
            {categories.map((category) => {
              const categoryBlocks = groupedBlocks[category] || [];
              const expanded = expandedCategories[category] || false;

              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base font-semibold text-gray-900 hover:text-primary transition-colors w-full"
                  >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="capitalize">{category}</span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs ml-auto">
                      {categoryBlocks.length}
                    </Badge>
                    <ChevronDown
                      className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform flex-shrink-0',
                        expanded ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </button>

                  {expanded && (
                    <div className="space-y-2 sm:space-y-2.5 ml-0 sm:ml-2 pl-0 sm:pl-4 border-l border-gray-200 sm:border-l-2">
                      {categoryBlocks.map((block: SavedBlock) => {
                        const daysAgo = Math.floor((Date.now() - new Date(block.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        const badge = daysAgo <= 7 ? { label: '✨ New', variant: 'default' as const } : undefined;

                        return (
                          <LibraryCard
                            key={block.id}
                            id={block.id}
                            title={block.name}
                            description={block.description}
                            badge={badge}
                            isBookmarked={block.isBookmarked}
                            onBookmarkToggle={() => toggleBookmarkBlock(block.id)}
                            onDoubleClick={() => {
                              pageBuilderLogger.info('BLOCK_APPLY', 'Double-click applying saved block', { blockId: block.id });
                              applySavedBlock(block);
                            }}
                            metadata={[
                              { label: 'Blocks', value: block.blocks.length },
                              { label: 'Created', value: new Date(block.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                            ]}
                            actions={[
                              {
                                label: 'Apply to Page',
                                icon: <Plus className="w-4 h-4" />,
                                onClick: () => applySavedBlock(block),
                              },
                              {
                                label: 'Duplicate',
                                icon: <Copy className="w-4 h-4" />,
                                onClick: () => duplicateSavedBlock(block),
                              },
                              { separator: true, label: '', onClick: () => {} },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="w-4 h-4" />,
                                variant: 'destructive',
                                onClick: () => deleteSavedBlock(block.id),
                              },
                            ]}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {savedBlocks.length > 0 && (
        <div className="flex-shrink-0 p-2 sm:p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span>
              Double-click to apply | 📋 Drag to canvas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
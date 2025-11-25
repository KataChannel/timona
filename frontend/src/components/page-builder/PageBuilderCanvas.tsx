import React, { useMemo, useCallback, useState } from 'react';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Layout,
  Search,
  Star,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePageState, useUIState, usePageActions } from './contexts';
import { BlockRenderer } from './blocks/BlockRenderer';
import { SortableBlockWrapper } from './blocks/SortableBlockWrapper';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlockType } from '@/types/page-builder';
import { BLOCK_TYPES, BLOCK_TYPE_GROUPS } from '@/constants/blockTypes';
import { pageBuilderLogger, LOG_OPERATIONS } from './utils/pageBuilderLogger';


/**
 * PageBuilderCanvas Component
 * 
 * The main editing area where blocks are displayed and can be:
 * - Reordered via drag-and-drop
 * - Edited in place
 * - Deleted
 * - Previewed (read-only mode)
 * 
 * Features:
 * - Drag-and-drop with visual feedback
 * - Nested block support
 * - Preview mode toggle
 * - Empty state
 * 
 * Performance optimizations:
 * - Wrapped with React.memo
 * - useMemo for block IDs array
 * - useCallback for update handlers
 */
const PageBuilderCanvasComponent = React.memo(function PageBuilderCanvasComponent() {
  // Use individual hooks for better performance
  const { blocks, draggedBlock } = usePageState();
  const { showPreview } = useUIState();
  const { handleBlockUpdate, handleBlockDelete, handleBlockCopy, handleAddChild, handleSelectBlock, handleAddBlock } = usePageActions();
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load bookmarks from localStorage on mount
  const [bookmarkedBlocks, setBookmarkedBlocks] = useState<Set<BlockType>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('pagebuilder-bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save bookmarks to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pagebuilder-bookmarks', JSON.stringify(Array.from(bookmarkedBlocks)));
    } catch (error) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_ADD, 'Failed to save bookmarks', { error });
    }
  }, [bookmarkedBlocks]);

  // Memoize block IDs array to prevent SortableContext re-renders
  const blockIds = useMemo(() => blocks.map(b => b.id), [blocks]);

  // Memoize empty state check
  const hasBlocks = useMemo(() => blocks.length > 0, [blocks.length]);

  // Main droppable zone for canvas - accepts both existing blocks and new blocks from LeftPanel
  // IMPORTANT: This droppable is OUTSIDE the SortableContext to properly receive new-block drops
  const { setNodeRef: setCanvasRef, isOver: isCanvasOver, node: canvasNode } = useDroppable({
    id: 'canvas-droppable',
    data: {
      type: 'canvas',
      accepts: ['existing-block', 'new-block'],
    },
  });
  
  // Log droppable setup (dev only to prevent performance overhead)
  React.useEffect(() => {
    pageBuilderLogger.debug('CANVAS_SETUP', 'Canvas droppable initialized', {
      hasRef: !!setCanvasRef,
      isOver: isCanvasOver,
    });
  }, [setCanvasRef, isCanvasOver]);

  // Block types grouped by category with lucide icons
  const blockTypeGroups = BLOCK_TYPE_GROUPS;

  // Flatten for dropdown rendering
  const commonBlockTypes = blockTypeGroups.flatMap(group => group.blocks);

  // Handle add block with feedback
  const handleAddBlockClick = useCallback(async (blockType: BlockType) => {
    try {
      await handleAddBlock(blockType);
      setIsAddingBlock(false);
      setSearchQuery(''); // Clear search after adding
    } catch (error) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_ADD, 'Failed to add block', { blockType, error });
    }
  }, [handleAddBlock]);

  // Toggle bookmark
  const toggleBookmark = useCallback((blockType: BlockType, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown item click
    setBookmarkedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockType)) {
        next.delete(blockType);
      } else {
        next.add(blockType);
      }
      return next;
    });
  }, []);

  // Filter blocks based on search query
  const filteredBlockGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return blockTypeGroups;
    }

    const query = searchQuery.toLowerCase();
    return blockTypeGroups.map(group => ({
      ...group,
      blocks: group.blocks.filter(block => 
        block.label.toLowerCase().includes(query) ||
        block.type.toLowerCase().includes(query)
      )
    })).filter(group => group.blocks.length > 0);
  }, [searchQuery, blockTypeGroups]);

  // Get bookmarked blocks
  const bookmarkedBlocksList = useMemo(() => {
    if (bookmarkedBlocks.size === 0) return [];
    
    return blockTypeGroups.flatMap(group => group.blocks)
      .filter(block => bookmarkedBlocks.has(block.type));
  }, [bookmarkedBlocks, blockTypeGroups]);

  // Render dropdown menu content with grouped items
  const renderDropdownItems = () => {
    return (
      <>
        {/* Bookmarked Blocks Section */}
        {bookmarkedBlocksList.length > 0 && (
          <div>
            <div className="px-2 py-1.5 text-xs font-semibold text-yellow-600 uppercase flex items-center gap-1">
              <Star size={12} className="fill-yellow-500 text-yellow-500" />
              Bookmarked
            </div>
            {bookmarkedBlocksList.map(({ type, label, icon: IconComponent }) => (
              <DropdownMenuItem 
                key={type}
                onClick={() => handleAddBlockClick(type)}
                className="cursor-pointer gap-2 group"
              >
                <IconComponent size={16} className="text-gray-600" />
                <span className="flex-1">{label}</span>
                <Star 
                  size={14} 
                  className="fill-yellow-500 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => toggleBookmark(type, e)}
                />
              </DropdownMenuItem>
            ))}
            <div className="my-1 mx-0 h-px bg-gray-200" />
          </div>
        )}

        {/* Filtered Block Groups */}
        {filteredBlockGroups.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            <Search size={32} className="mx-auto mb-2 opacity-30" />
            No blocks found for "{searchQuery}"
          </div>
        ) : (
          filteredBlockGroups.map((group, groupIndex) => (
            <div key={group.category}>
              {(groupIndex > 0 || bookmarkedBlocksList.length > 0) && (
                <div className="my-1 mx-0 h-px bg-gray-200" />
              )}
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                {group.category}
              </div>
              {group.blocks.map(({ type, label, icon: IconComponent }) => {
                const isBookmarked = bookmarkedBlocks.has(type);
                return (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => handleAddBlockClick(type)}
                    className="cursor-pointer gap-2 group"
                  >
                    <IconComponent size={16} className="text-gray-600" />
                    <span className="flex-1">{label}</span>
                    <Star 
                      size={14} 
                      className={cn(
                        "transition-all",
                        isBookmarked 
                          ? "fill-yellow-500 text-yellow-500" 
                          : "text-gray-300 opacity-0 group-hover:opacity-100"
                      )}
                      onClick={(e) => toggleBookmark(type, e)}
                    />
                  </DropdownMenuItem>
                );
              })}
            </div>
          ))
        )}
      </>
    );
  };

  return (
    <div className="flex-1 p-12 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        {showPreview ? (
          // Preview Mode - Read-only view
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-3xl font-bold mb-6">Preview</h2>
            {blocks.map(block => (
              <BlockRenderer
                key={block.id}
                block={block}
                isEditing={false}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          // Edit Mode - Sortable enabled
          <SortableContext 
            items={blockIds}
            strategy={verticalListSortingStrategy}
          >
            <div 
              ref={setCanvasRef} 
              className={`space-y-4 min-h-[400px] p-6 rounded-lg transition-all duration-200 ${
                isCanvasOver 
                  ? 'bg-blue-50 border-2 border-blue-400 border-dashed shadow-lg shadow-blue-200' 
                  : 'bg-white border-2 border-dashed border-gray-200'
              }`}
            >
              {/* Drop zone hint - optimized for performance */}
              <div className={cn(
                "absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-200",
                isCanvasOver ? "opacity-100" : "opacity-0"
              )}>
                <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg animate-bounce">
                  📍 Drop here to add block
                </div>
              </div>
              
              {!hasBlocks ? (
                // Empty State - Droppable
                <Card className={`p-8 text-center border-2 transition-all duration-200 ${
                  isCanvasOver
                    ? 'border-blue-400 border-solid bg-blue-50 scale-105'
                    : 'border-gray-300 border-dashed hover:border-primary hover:bg-primary/5'
                }`}>
                  <div className="text-gray-500">
                    <Layout size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No blocks yet</p>
                    <p className="text-sm mb-6">Drag and drop blocks from the left panel to start building</p>
                    {isCanvasOver && (
                      <p className="text-sm text-blue-600 font-semibold mb-4">🎯 Ready to drop!</p>
                    )}
                    
                    {/* Add Block Dropdown Button */}
                    <DropdownMenu open={isAddingBlock} onOpenChange={setIsAddingBlock}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          className="gap-2"
                          variant="default"
                        >
                          <Plus size={16} />
                          Add Block
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-64 max-h-96 overflow-hidden flex flex-col">
                        {/* Search Input */}
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Search blocks..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 h-8 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="overflow-y-auto max-h-80">
                          {renderDropdownItems()}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ) : (
                // Block List with Sortable Wrappers
                <>
                  {/* Blocks List */}
                  <div className="space-y-4">
                    {blocks.map(block => (
                      <SortableBlockWrapper
                        key={block.id}
                        block={block}
                        isEditing={true}
                        onUpdate={(content: any, style: any) => handleBlockUpdate(block.id, content, style)}
                        onDelete={() => handleBlockDelete(block.id)}
                        onCopy={handleBlockCopy}
                        onAddChild={handleAddChild}
                        onUpdateChild={handleBlockUpdate}
                        onDeleteChild={handleBlockDelete}
                        onSelect={handleSelectBlock}
                        depth={0}
                      />
                    ))}
                    
                    {/* Add Block Button at Bottom */}
                    <div className="pt-4 border-t border-gray-200 mt-6">
                      <DropdownMenu open={isAddingBlock} onOpenChange={setIsAddingBlock}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            className="w-full gap-2"
                            variant="secondary"
                          >
                            <Plus size={16} />
                            Add New Block
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-64 max-h-96 overflow-hidden flex flex-col">
                          {/* Search Input */}
                          <div className="p-2 border-b sticky top-0 bg-white z-10">
                            <div className="relative">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="text"
                                placeholder="Search blocks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          
                          {/* Scrollable Content */}
                          <div className="overflow-y-auto max-h-80">
                            {renderDropdownItems()}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
});

// Export with React.memo to prevent unnecessary re-renders
// Only re-renders when blocks, draggedBlock, or showPreview change
export const PageBuilderCanvas = PageBuilderCanvasComponent;

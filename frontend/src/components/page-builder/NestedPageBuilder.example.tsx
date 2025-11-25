/**
 * Example: Advanced Page Builder with Nested Operations
 * 
 * This example demonstrates how to use useNestedBlockOperations hook
 * for building complex page layouts with nested blocks.
 */

import React, { useState } from 'react';
import { useNestedBlockOperations } from '@/hooks/usePageBuilder';
import { BlockType } from '@/types/page-builder';
import { toast } from 'sonner';

interface NestedPageBuilderProps {
  pageId: string;
}

export default function NestedPageBuilder({ pageId }: NestedPageBuilderProps) {
  const {
    // Operations
    addChildBlock,
    moveBlockToContainer,
    duplicateBlock,
    updateBlock,
    deleteBlock,
    
    // Query helpers
    getAllBlocks,
    getBlockTree,
    getBlockChildren,
    getBlockParent,
    getBlockAncestors,
    isContainerBlock,
    
    // Data
    page,
    refetch
  } = useNestedBlockOperations(pageId);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  // Get tree structure
  const blockTree = getBlockTree();
  const selectedBlock = selectedBlockId 
    ? getAllBlocks().find(b => b.id === selectedBlockId)
    : null;

  /**
   * Add block as child to selected container
   */
  const handleAddChild = async (blockType: BlockType) => {
    if (!selectedBlockId) {
      toast.error('Please select a container first');
      return;
    }

    const parent = getAllBlocks().find(b => b.id === selectedBlockId);
    
    if (!parent) {
      toast.error('Parent block not found');
      return;
    }

    if (!isContainerBlock(parent.type)) {
      toast.error('Selected block cannot contain children');
      return;
    }

    try {
      await addChildBlock(
        selectedBlockId,
        blockType,
        getDefaultContent(blockType)
      );
      
      // Auto expand parent to show new child
      setExpandedBlocks(prev => {
        const next = new Set(prev);
        next.add(selectedBlockId);
        return next;
      });
      
      toast.success(`${blockType} added to ${parent.type}`);
    } catch (error) {
      console.error('Add child failed:', error);
    }
  };

  /**
   * Duplicate selected block with all children
   */
  const handleDuplicate = async () => {
    if (!selectedBlockId) {
      toast.error('Please select a block first');
      return;
    }

    try {
      const duplicated = await duplicateBlock(selectedBlockId);
      toast.success('Block duplicated successfully');
      setSelectedBlockId(duplicated?.id || null);
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  /**
   * Move block up in order
   */
  const handleMoveUp = async () => {
    if (!selectedBlockId) return;

    const block = getAllBlocks().find(b => b.id === selectedBlockId);
    if (!block || block.order === 0) return;

    try {
      await moveBlockToContainer(
        selectedBlockId,
        block.parentId || null,
        block.order - 1
      );
      toast.success('Block moved up');
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  /**
   * Move block down in order
   */
  const handleMoveDown = async () => {
    if (!selectedBlockId) return;

    const block = getAllBlocks().find(b => b.id === selectedBlockId);
    if (!block) return;

    const siblings = getBlockChildren(block.parentId || '');
    if (block.order >= siblings.length - 1) return;

    try {
      await moveBlockToContainer(
        selectedBlockId,
        block.parentId || null,
        block.order + 1
      );
      toast.success('Block moved down');
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  /**
   * Delete selected block
   */
  const handleDelete = async () => {
    if (!selectedBlockId) return;

    const block = getAllBlocks().find(b => b.id === selectedBlockId);
    if (!block) return;

    const confirm = window.confirm(
      `Delete ${block.type}? This will also delete all nested blocks.`
    );

    if (!confirm) return;

    try {
      await deleteBlock(selectedBlockId);
      setSelectedBlockId(null);
      toast.success('Block deleted');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  /**
   * Toggle block expansion in tree view
   */
  const toggleExpand = (blockId: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  /**
   * Render block tree recursively
   */
  const renderBlockTree = (blocks: any[], depth = 0) => {
    return blocks.map(block => {
      const hasChildren = block.children && block.children.length > 0;
      const isExpanded = expandedBlocks.has(block.id);
      const isSelected = selectedBlockId === block.id;
      const isContainer = isContainerBlock(block.type);

      return (
        <div key={block.id} className="mb-1">
          {/* Block Item */}
          <div
            className={`
              flex items-center gap-2 p-2 rounded cursor-pointer
              hover:bg-gray-100 transition-colors
              ${isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
            `}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => setSelectedBlockId(block.id)}
          >
            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(block.id);
                }}
                className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            {!hasChildren && <div className="w-5" />}

            {/* Block Type Icon */}
            <span className="text-lg">
              {getBlockIcon(block.type)}
            </span>

            {/* Block Info */}
            <div className="flex-1 flex items-center gap-2">
              <span className="font-medium">{block.type}</span>
              
              {isContainer && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  Container
                </span>
              )}
              
              {hasChildren && (
                <span className="text-xs text-gray-500">
                  ({block.children.length} {block.children.length === 1 ? 'child' : 'children'})
                </span>
              )}
              
              <span className="text-xs text-gray-400">
                depth: {block.depth || 0}
              </span>
            </div>

            {/* Visibility Indicator */}
            {!block.isVisible && (
              <span className="text-xs text-gray-400">👁️ Hidden</span>
            )}
          </div>

          {/* Nested Children */}
          {hasChildren && isExpanded && (
            <div className="ml-2">
              {renderBlockTree(block.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Block Tree */}
      <div className="w-80 border-r bg-white overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">Page Structure</h2>
          <div className="text-sm text-gray-600 mt-1">
            Total: {getAllBlocks().length} blocks
          </div>
        </div>
        
        <div className="p-2">
          {blockTree.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No blocks yet. Add your first block!
            </div>
          ) : (
            renderBlockTree(blockTree)
          )}
        </div>
      </div>

      {/* Center - Canvas (Preview) */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          {/* Render actual blocks here with BlockRenderer */}
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
            Preview area - Render blocks here
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties & Actions */}
      <div className="w-80 border-l bg-white overflow-y-auto">
        {selectedBlock ? (
          <div>
            {/* Block Info */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg mb-2">
                {selectedBlock.type}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{selectedBlock.id.slice(0, 8)}...</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Depth:</span>
                  <span>{selectedBlock.depth || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Order:</span>
                  <span>{selectedBlock.order}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Visible:</span>
                  <span>{selectedBlock.isVisible ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="p-4 border-b bg-blue-50">
              <div className="text-xs text-gray-600 mb-1">Location:</div>
              <div className="text-sm">
                {getBlockAncestors(selectedBlock.id).length > 0 ? (
                  <span>
                    {getBlockAncestors(selectedBlock.id)
                      .reverse()
                      .map(a => a.type)
                      .join(' → ')}
                    {' → '}
                  </span>
                ) : (
                  <span className="text-gray-500">Root → </span>
                )}
                <span className="font-semibold">{selectedBlock.type}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-b">
              <h4 className="font-semibold mb-3">Actions</h4>
              
              <div className="space-y-2">
                <button
                  onClick={handleDuplicate}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  📋 Duplicate
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleMoveUp}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    ↑ Move Up
                  </button>
                  
                  <button
                    onClick={handleMoveDown}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    ↓ Move Down
                  </button>
                </div>
                
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            {/* Add Child (if container) */}
            {isContainerBlock(selectedBlock.type) && (
              <div className="p-4 border-b">
                <h4 className="font-semibold mb-3">Add Child Block</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Content Blocks */}
                  <button
                    onClick={() => handleAddChild('TEXT' as BlockType)}
                    className="px-3 py-2 text-sm bg-green-100 rounded hover:bg-green-200"
                  >
                    📝 Text
                  </button>
                  
                  <button
                    onClick={() => handleAddChild('IMAGE' as BlockType)}
                    className="px-3 py-2 text-sm bg-green-100 rounded hover:bg-green-200"
                  >
                    🖼️ Image
                  </button>
                  
                  <button
                    onClick={() => handleAddChild('BUTTON' as BlockType)}
                    className="px-3 py-2 text-sm bg-green-100 rounded hover:bg-green-200"
                  >
                    🔘 Button
                  </button>
                  
                  <button
                    onClick={() => handleAddChild('CARD' as BlockType)}
                    className="px-3 py-2 text-sm bg-green-100 rounded hover:bg-green-200"
                  >
                    🃏 Card
                  </button>
                  
                  {/* Container Blocks */}
                  <button
                    onClick={() => handleAddChild('CONTAINER' as BlockType)}
                    className="px-3 py-2 text-sm bg-purple-100 rounded hover:bg-purple-200"
                  >
                    📦 Container
                  </button>
                  
                  <button
                    onClick={() => handleAddChild('GRID' as BlockType)}
                    className="px-3 py-2 text-sm bg-purple-100 rounded hover:bg-purple-200"
                  >
                    ⊞ Grid
                  </button>
                  
                  <button
                    onClick={() => handleAddChild('FLEX_ROW' as BlockType)}
                    className="px-3 py-2 text-sm bg-purple-100 rounded hover:bg-purple-200"
                  >
                    ↔ Flex Row
                  </button>
                  
                  <button
                    onClick={() => handleAddChild('FLEX_COLUMN' as BlockType)}
                    className="px-3 py-2 text-sm bg-purple-100 rounded hover:bg-purple-200"
                  >
                    ↕ Flex Col
                  </button>
                </div>
              </div>
            )}

            {/* Children List */}
            {getBlockChildren(selectedBlock.id).length > 0 && (
              <div className="p-4">
                <h4 className="font-semibold mb-3">
                  Children ({getBlockChildren(selectedBlock.id).length})
                </h4>
                
                <div className="space-y-2">
                  {getBlockChildren(selectedBlock.id).map((child, index) => (
                    <div
                      key={child.id}
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedBlockId(child.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{getBlockIcon(child.type)}</span>
                        <span className="text-sm font-medium">{child.type}</span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Select a block to view properties
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get default content for block type
 */
function getDefaultContent(blockType: BlockType) {
  const defaults: Record<string, any> = {
    TEXT: { content: 'New text block' },
    IMAGE: { src: '/placeholder.jpg', alt: 'Image' },
    BUTTON: { text: 'Click me', href: '#' },
    CARD: { title: 'Card Title', description: 'Card description' },
    CONTAINER: { layout: 'stack', gap: 16 },
    GRID: { columns: 3, gap: 20 },
    FLEX_ROW: { justifyContent: 'start', gap: 16 },
    FLEX_COLUMN: { alignItems: 'start', gap: 16 },
  };
  
  return defaults[blockType] || {};
}

/**
 * Get icon for block type
 */
function getBlockIcon(blockType: string) {
  const icons: Record<string, string> = {
    TEXT: '📝',
    IMAGE: '🖼️',
    HERO: '🎯',
    BUTTON: '🔘',
    CARD: '🃏',
    CONTAINER: '📦',
    SECTION: '📄',
    GRID: '⊞',
    FLEX_ROW: '↔',
    FLEX_COLUMN: '↕',
    DYNAMIC: '⚡',
  };
  
  return icons[blockType] || '📌';
}

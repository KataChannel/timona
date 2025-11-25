/**
 * PageBuilder Advanced Features - Structure Tree View
 * Phase 6.2: Hierarchical Element Display
 * 
 * Tree view for page structure with:
 * - Hierarchical element display
 * - Drag-drop reordering
 * - Expand/collapse nodes
 * - Quick navigation and selection
 */

'use client';

import React, { useState, useMemo } from 'react';
import { PageElement } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Search,
  Layers,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================================
// Types
// ============================================================================

export interface TreeNode extends PageElement {
  depth: number;
  isExpanded?: boolean;
  isVisible?: boolean;
  isLocked?: boolean;
}

interface StructureTreeProps {
  elements: PageElement[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onReorder?: (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => void;
}

// ============================================================================
// Structure Tree Component
// ============================================================================

export function StructureTree({
  elements,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onReorder,
}: StructureTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null);

  // Build tree structure with depth
  const treeNodes = useMemo(() => {
    const buildTree = (elements: PageElement[], depth = 0): TreeNode[] => {
      const nodes: TreeNode[] = [];

      elements.forEach((element) => {
        // Add element as node
        nodes.push({
          ...element,
          depth,
          isExpanded: expandedIds.has(element.id),
        });

        // Add children if expanded
        if (element.children && expandedIds.has(element.id)) {
          nodes.push(...buildTree(element.children, depth + 1));
        }
      });

      return nodes;
    };

    return buildTree(elements);
  }, [elements, expandedIds]);

  // Filter by search
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return treeNodes;

    const query = searchQuery.toLowerCase();
    return treeNodes.filter((node) => {
      return (
        node.type.toLowerCase().includes(query) ||
        node.id.toLowerCase().includes(query) ||
        (node.content && node.content.toLowerCase().includes(query))
      );
    });
  }, [treeNodes, searchQuery]);

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all
  const expandAll = () => {
    const getAllIds = (elements: PageElement[]): string[] => {
      return elements.flatMap((el) => [
        el.id,
        ...(el.children ? getAllIds(el.children) : []),
      ]);
    };
    setExpandedIds(new Set(getAllIds(elements)));
  };

  // Collapse all
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedId === id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Determine drop position based on cursor position
    let position: 'before' | 'after' | 'inside';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    setDropTarget({ id, position });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedId && dropTarget && onReorder) {
      onReorder(draggedId, dropTarget.id, dropTarget.position);
    }

    setDraggedId(null);
    setDropTarget(null);
  };

  // Get icon for element type
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      container: '📦',
      section: '📄',
      text: '📝',
      image: '🖼️',
      button: '🔘',
      grid: '⊞',
      flex_row: '↔️',
      flex_column: '↕️',
    };
    return iconMap[type.toLowerCase()] || '📌';
  };

  // Empty state
  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Layers className="w-12 h-12 mb-4" />
        <p className="text-sm">No elements in page</p>
        <p className="text-xs mt-1">Add elements to see them here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">Structure</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="h-7 text-xs"
            >
              Expand All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="h-7 text-xs"
            >
              Collapse All
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNodes.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              isSelected={selectedId === node.id}
              isDragging={draggedId === node.id}
              dropTarget={dropTarget?.id === node.id ? dropTarget.position : null}
              hasChildren={!!node.children && node.children.length > 0}
              onSelect={() => onSelect?.(node.id)}
              onToggleExpand={() => toggleExpand(node.id)}
              onToggleVisibility={() => onToggleVisibility?.(node.id)}
              onToggleLock={() => onToggleLock?.(node.id)}
              onDelete={() => onDelete?.(node.id)}
              onDuplicate={() => onDuplicate?.(node.id)}
              onDragStart={(e) => handleDragStart(e, node.id)}
              onDragOver={(e) => handleDragOver(e, node.id)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              getTypeIcon={getTypeIcon}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-600">
        {filteredNodes.length} of {treeNodes.length} elements
      </div>
    </div>
  );
}

// ============================================================================
// Tree Node Item Component
// ============================================================================

interface TreeNodeItemProps {
  node: TreeNode;
  isSelected: boolean;
  isDragging: boolean;
  dropTarget: 'before' | 'after' | 'inside' | null;
  hasChildren: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  getTypeIcon: (type: string) => string;
}

function TreeNodeItem({
  node,
  isSelected,
  isDragging,
  dropTarget,
  hasChildren,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  getTypeIcon,
}: TreeNodeItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Drop indicator - before */}
      {dropTarget === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}

      {/* Node */}
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group flex items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer
          transition-colors duration-150
          ${isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
          ${isDragging ? 'opacity-50' : ''}
          ${dropTarget === 'inside' ? 'ring-2 ring-blue-500 ring-inset' : ''}
        `}
        style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
        onClick={onSelect}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {node.isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Icon */}
        <span className="text-base">{getTypeIcon(node.type)}</span>

        {/* Label */}
        <span className="flex-1 truncate font-medium">
          {node.type}
        </span>

        {/* ID Badge */}
        <span className="text-xs text-gray-400 font-mono">
          #{node.id.slice(0, 6)}
        </span>

        {/* Actions */}
        {isHovered && (
          <div className="flex items-center gap-0.5 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
            >
              {node.isVisible !== false ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
            >
              {node.isLocked ? (
                <Lock className="w-3 h-3 text-gray-600" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Drop indicator - after */}
      {dropTarget === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}
    </div>
  );
}

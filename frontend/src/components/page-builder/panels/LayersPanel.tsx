/**
 * PageBuilder Advanced Features - Layers Panel
 * Phase 6.3: Visual Layer Management
 * 
 * Layers panel with:
 * - Visual layer stacking display
 * - Show/hide toggles
 * - Lock/unlock controls
 * - Z-index management
 * - Drag-drop reordering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { PageElement } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Layers as LayersIcon,
  GripVertical,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface LayerElement extends PageElement {
  zIndex?: number;
  isVisible?: boolean;
  isLocked?: boolean;
  opacity?: number;
}

interface LayersPanelProps {
  elements: LayerElement[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onChangeOpacity?: (id: string, opacity: number) => void;
  onChangeZIndex?: (id: string, zIndex: number) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

// ============================================================================
// Layers Panel Component
// ============================================================================

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onChangeOpacity,
  onChangeZIndex,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onReorder,
}: LayersPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Sort elements by z-index (highest first)
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => {
      const zIndexA = a.zIndex ?? 0;
      const zIndexB = b.zIndex ?? 0;
      return zIndexB - zIndexA;
    });
  }, [elements]);

  // Get element index
  const getElementIndex = (id: string) => {
    return sortedElements.findIndex(el => el.id === id);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedIndex !== null && dropTargetIndex !== null && onReorder) {
      onReorder(draggedIndex, dropTargetIndex);
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // Get type icon
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
        <LayersIcon className="w-12 h-12 mb-4" />
        <p className="text-sm">No layers</p>
        <p className="text-xs mt-1">Add elements to create layers</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">Layers</h3>
          <div className="text-xs text-gray-500">
            {elements.length} layer{elements.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedElements.map((element, index) => (
            <LayerItem
              key={element.id}
              element={element}
              index={index}
              isSelected={selectedId === element.id}
              isDragging={draggedIndex === index}
              isDropTarget={dropTargetIndex === index}
              onSelect={() => onSelect?.(element.id)}
              onToggleVisibility={() => onToggleVisibility?.(element.id)}
              onToggleLock={() => onToggleLock?.(element.id)}
              onChangeOpacity={(opacity) => onChangeOpacity?.(element.id, opacity)}
              onChangeZIndex={(zIndex) => onChangeZIndex?.(element.id, zIndex)}
              onMoveUp={() => onMoveUp?.(element.id)}
              onMoveDown={() => onMoveDown?.(element.id)}
              onDelete={() => onDelete?.(element.id)}
              onDuplicate={() => onDuplicate?.(element.id)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              getTypeIcon={getTypeIcon}
              canMoveUp={index < sortedElements.length - 1}
              canMoveDown={index > 0}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// Layer Item Component
// ============================================================================

interface LayerItemProps {
  element: LayerElement;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onChangeOpacity: (opacity: number) => void;
  onChangeZIndex: (zIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  getTypeIcon: (type: string) => string;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function LayerItem({
  element,
  index,
  isSelected,
  isDragging,
  isDropTarget,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onChangeOpacity,
  onChangeZIndex,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  getTypeIcon,
  canMoveUp,
  canMoveDown,
}: LayerItemProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`
        group border rounded-lg transition-all duration-150
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
        ${isDragging ? 'opacity-50' : ''}
        ${isDropTarget ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Main Content */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer"
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icon */}
        <span className="text-lg">{getTypeIcon(element.type)}</span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{element.type}</div>
          <div className="text-xs text-gray-500 font-mono">
            z-index: {element.zIndex ?? 0}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
          >
            {element.isVisible !== false ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
          >
            {element.isLocked ? (
              <Lock className="w-3.5 h-3.5 text-gray-600" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Extended Controls */}
      {showControls && isSelected && (
        <div className="border-t px-2 py-3 space-y-3 bg-gray-50">
          {/* Opacity Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-gray-700 font-medium">Opacity</label>
              <span className="text-gray-500">{Math.round((element.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={(element.opacity ?? 1) * 100}
              onChange={(e) => onChangeOpacity(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Z-Index Control */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-700 font-medium">Z-Index</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={onMoveDown}
                disabled={!canMoveDown}
              >
                <MoveDown className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={element.zIndex ?? 0}
                onChange={(e) => onChangeZIndex(parseInt(e.target.value) || 0)}
                className="h-7 text-center text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={onMoveUp}
                disabled={!canMoveUp}
              >
                <MoveUp className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

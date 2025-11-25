/**
 * LayoutBlockWrapper Component
 * 
 * Reusable wrapper cho Container, Flex, Grid, Section blocks
 * Cung cấp:
 * - Droppable zone cho nested children
 * - Settings panel management
 * - Visual feedback khi hover/drag over
 * - Nested block counter
 */

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PageBlock, BlockType } from '@/types/page-builder';
import { Settings, Trash2, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNestedBlockRenderer, useNestedDropZone } from '@/hooks/useNestedBlockRenderer';
import { isContainerBlockType } from '@/lib/nestedBlockUtils';

interface LayoutBlockWrapperProps {
  block: PageBlock;
  isEditable?: boolean;
  children?: React.ReactNode;
  onDelete: () => void;
  onAddChild?: (parentId: string) => void;
  onUpdate: (content: any, style?: any) => void;
  onUpdateChild?: (childId: string, content: any, style?: any) => void;
  onDeleteChild?: (childId: string) => void;
  containerStyles: React.CSSProperties;
  settingsPanel: React.ReactNode; // Render settings UI here
  title?: string;
}

export const LayoutBlockWrapper: React.FC<LayoutBlockWrapperProps> = ({
  block,
  isEditable = true,
  children,
  onDelete,
  onAddChild,
  onUpdate,
  onUpdateChild,
  onDeleteChild,
  containerStyles,
  settingsPanel,
  title = 'Layout Settings',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Debug logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LayoutBlockWrapper ${block.id}] Props Debug:`, {
        hasOnAddChild: !!onAddChild,
        onAddChildType: typeof onAddChild,
        hasChildren: !!children,
        childrenType: typeof children,
        blockType: block.type,
        blockId: block.id,
      });
    }
  }, [onAddChild, children, block.id, block.type]);

  // Setup droppable zone
  const { droppableId, dropData } = useNestedDropZone({
    parentId: block.id,
    isContainerType: isContainerBlockType(block.type),
  });

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: dropData,
  });

  // Get nested info
  const { childrenCount, canAddChildren } = useNestedBlockRenderer({
    parentBlock: block,
    onUpdateChild,
    onDeleteChild,
  });

  if (!isEditable) {
    return (
      <div ref={setNodeRef} style={containerStyles}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={containerStyles}
      className={`group transition-all duration-200 relative ${
        isOver
          ? 'ring-2 ring-blue-500 bg-blue-50 scale-105'
          : 'hover:ring-2 hover:ring-gray-300'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Control Bar */}
      {isEditable && (isHovering || isEditing) && (
        <div className="absolute top-2 right-2 flex gap-2 z-10 animate-in fade-in duration-200">
          {/* Debug: Show button status in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 absolute -bottom-6 right-0 whitespace-nowrap bg-white px-1 rounded">
              canAdd={String(canAddChildren)} | onAddChild={String(!!onAddChild)}
            </div>
          )}
          
          {canAddChildren && onAddChild && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log(`[LayoutBlockWrapper ${block.id}] Add Child clicked:`, { 
                  hasOnAddChild: !!onAddChild, 
                  canAddChildren,
                  childrenCount,
                  blockId: block.id,
                  blockType: block.type,
                });
                if (onAddChild) {
                  onAddChild(block.id);
                } else {
                  console.error('[LayoutBlockWrapper] onAddChild is undefined!');
                }
              }}
              className="bg-white shadow-sm hover:shadow-md"
              title={`Add child block (${childrenCount} nested)`}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-xs">Add Child</span>
            </Button>
          )}
          
          {/* Show warning if onAddChild is missing in development */}
          {process.env.NODE_ENV === 'development' && !onAddChild && (
            <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">
              ⚠️ No onAddChild
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white shadow-sm hover:shadow-md"
            title="Edit settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="shadow-sm hover:shadow-md"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
            📍 Drop here to add nested block
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {isEditing && (
        <div className="absolute top-12 right-2 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-20 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3 text-sm">{title}</h3>

          <div className="space-y-3">
            {settingsPanel}

            {/* Nested Info */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {childrenCount} nested block{childrenCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 text-xs py-1" size="sm">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Children Blocks */}
      {children ? (
        <>
          {children}
        </>
      ) : (
        <div
          className={`text-center py-8 transition-colors duration-200 ${
            isOver ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No nested blocks yet</p>
          <p className="text-xs mt-1 opacity-75">Drop blocks or click "Add Child" to add content</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs mt-2 text-red-500">
              Debug: children prop is {children === undefined ? 'undefined' : children === null ? 'null' : 'defined but falsy'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

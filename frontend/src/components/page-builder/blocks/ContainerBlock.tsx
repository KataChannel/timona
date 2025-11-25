import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PageBlock, ContainerBlockContent } from '@/types/page-builder';
import { Settings, Trash2, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNestedBlockRenderer, useNestedDropZone } from '@/hooks/useNestedBlockRenderer';
import { isContainerBlockType } from '@/lib/nestedBlockUtils';

interface ContainerBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
  onAddChild?: (parentId: string) => void;
  onUpdateChild?: (childId: string, content: any, style?: any) => void;
  onDeleteChild?: (childId: string) => void;
  children?: React.ReactNode;
}

export const ContainerBlock: React.FC<ContainerBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  children,
}) => {
  const content = block.content as ContainerBlockContent;
  const [isEditing, setIsEditing] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const [editContent, setEditContent] = React.useState<ContainerBlockContent>(content || {
    layout: 'stack',
    gap: 16,
    padding: 16,
    backgroundColor: 'transparent',
    maxWidth: '100%',
    alignment: 'left',
  });

  // Setup droppable zone for nested children
  const { droppableId, dropData } = useNestedDropZone({
    parentId: block.id,
    isContainerType: isContainerBlockType(block.type),
  });

  const { setNodeRef, isOver, active } = useDroppable({
    id: droppableId,
    data: dropData,
  });

  // Use nested block renderer hook
  const { sortedChildren, childrenCount, canAddChildren } = useNestedBlockRenderer({
    parentBlock: block,
    onUpdateChild,
    onDeleteChild,
  });

  // Debug logging
  React.useEffect(() => {
    console.log(`[ContainerBlock ${block.id}] Debug:`, {
      canAddChildren,
      onAddChildDefined: !!onAddChild,
      onAddChildFunc: onAddChild,
      childrenCount,
      blockType: block.type,
    });
  }, [canAddChildren, onAddChild, childrenCount, block.id, block.type]);

  const handleSave = () => {
    onUpdate(editContent);
    setIsEditing(false);
  };

  const containerStyles: React.CSSProperties = {
    // First apply block.style from Properties Panel
    ...block.style,
    // Then override with container-specific styles
    display: 'flex',
    flexDirection: content.layout === 'stack' ? 'column' : content.layout === 'wrap' ? 'row' : 'column',
    flexWrap: content.layout === 'wrap' ? 'wrap' : 'nowrap',
    gap: `${content.gap || 16}px`,
    padding: `${content.padding || 16}px`,
    backgroundColor: content.backgroundColor || 'transparent',
    maxWidth: content.maxWidth || '100%',
    alignItems: content.alignment === 'center' ? 'center' : content.alignment === 'right' ? 'flex-end' : 'flex-start',
    width: '100%',
    position: 'relative',
    minHeight: children && React.Children.count(children) > 0 ? 'auto' : '100px',
    border: isEditable ? '2px dashed #ccc' : 'none',
    borderRadius: '8px',
    overflow: content.layout === 'scroll' ? 'auto' : 'visible',
  };

  return (
    <div 
      ref={setNodeRef}
      style={containerStyles} 
      className={`group transition-all duration-200 ${
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
          {/* Debug: Show button status */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 absolute -bottom-6 right-0 whitespace-nowrap">
              canAdd={String(canAddChildren)} | onAddChild={String(!!onAddChild)}
            </div>
          )}
          
          {/* Always show Add Child button in development for testing */}
          {process.env.NODE_ENV === 'development' || (canAddChildren && onAddChild) ? (
            <Button
              size="sm"
              variant={canAddChildren && onAddChild ? "outline" : "destructive"}
              onClick={() => {
                console.log(`[ContainerBlock ${block.id}] Add Child clicked:`, { canAddChildren, hasOnAddChild: !!onAddChild, block: block.id });
                if (onAddChild) {
                  onAddChild(block.id);
                } else {
                  console.error('[ContainerBlock] onAddChild is undefined!');
                }
              }}
              className="bg-white shadow-sm hover:shadow-md"
              title={`Add child block (${childrenCount} nested) - canAdd: ${canAddChildren}`}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-xs">Add {canAddChildren ? "Child" : "- canAdd=false"}</span>
            </Button>
          ) : null}
          
          {process.env.NODE_ENV === 'development' && !onAddChild && (
            <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">
              ⚠️ onAddChild undefined!
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && !canAddChildren && (
            <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded whitespace-nowrap">
              ⚠️ canAddChildren false!
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white shadow-sm hover:shadow-md"
            title="Edit container settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="shadow-sm hover:shadow-md"
            title="Delete container"
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
          <h3 className="font-semibold mb-3 text-sm">Container Settings</h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Layout</Label>
              <Select
                value={editContent.layout || 'stack'}
                onValueChange={(value) => setEditContent({ ...editContent, layout: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stack">Stack (Vertical)</SelectItem>
                  <SelectItem value="wrap">Wrap (Horizontal)</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Gap (px)</Label>
              <Input
                type="number"
                value={editContent.gap || 16}
                onChange={(e) => setEditContent({ ...editContent, gap: parseInt(e.target.value) })}
                className="text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Padding (px)</Label>
              <Input
                type="number"
                value={editContent.padding || 16}
                onChange={(e) => setEditContent({ ...editContent, padding: parseInt(e.target.value) })}
                className="text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Background Color</Label>
              <Input
                type="text"
                placeholder="#ffffff or transparent"
                value={editContent.backgroundColor || 'transparent'}
                onChange={(e) => setEditContent({ ...editContent, backgroundColor: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Max Width</Label>
              <Input
                type="text"
                placeholder="100% or 800px"
                value={editContent.maxWidth || '100%'}
                onChange={(e) => setEditContent({ ...editContent, maxWidth: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Alignment</Label>
              <Select
                value={editContent.alignment || 'left'}
                onValueChange={(value) => setEditContent({ ...editContent, alignment: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nested Info */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {childrenCount} nested block{childrenCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 text-xs py-1" size="sm">
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 text-xs py-1" size="sm">
                Cancel
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
        <div className={`empty-state text-center py-8 transition-colors duration-200 border-2 border-dashed rounded-lg ${
          isOver 
            ? 'text-blue-600 border-blue-400 bg-blue-50' 
            : 'text-gray-400 border-gray-300 bg-gray-50/50'
        }`}>
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No nested blocks yet</p>
          <p className="text-xs mt-1 opacity-75">Drop blocks here or click "Add Child" to add nested content</p>
          {process.env.NODE_ENV === 'development' && onAddChild && (
            <div className="text-xs mt-2 text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
              ✓ Ready to add blocks (onAddChild available)
            </div>
          )}
          {process.env.NODE_ENV === 'development' && !onAddChild && (
            <div className="text-xs mt-2 text-red-500 bg-red-50 inline-block px-2 py-1 rounded">
              ⚠ onAddChild callback missing
            </div>
          )}
        </div>
      )}
    </div>
  );
};

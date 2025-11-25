import React, { useContext, useEffect } from 'react';
import { PageBlock, BlockType } from '@/types/page-builder';
import { PageStateContext } from '../contexts/PageStateContext';
import { BlockLoader } from './BlockLoader';
import BlockErrorBoundary from '../BlockErrorBoundary';

export interface BlockRendererProps {
  block: PageBlock;
  isEditing?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
  onAddChild?: (parentId: string) => void;
  onUpdateChild?: (blockId: string, content: any, style?: any) => void;
  onDeleteChild?: (blockId: string) => void;
  onSelect?: (blockId: string | null) => void;
  depth?: number;
  isGridChild?: boolean; // Flag to indicate if this block is a direct child of a Grid
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isEditing = true,
  onUpdate,
  onDelete,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onSelect,
  depth = 0,
  isGridChild = false,
}) => {
  // Get selected block ID from context for visual highlighting (optional - for editor only)
  // Use context directly instead of usePageState to make it optional
  const pageState = useContext(PageStateContext);
  const selectedBlockId = pageState?.selectedBlockId ?? null;
  const isSelected = selectedBlockId === block.id;

  const commonProps = {
    block,
    isEditable: isEditing,
    onUpdate: (content: any, style?: any) => onUpdate(content, style),
    onDelete,
  };

  // Handle block selection
  const handleBlockClick = (e: React.MouseEvent) => {
    if (isEditing && onSelect) {
      e.stopPropagation(); // Prevent parent blocks from being selected
      onSelect(block.id);
    }
  };

  const isContainerBlock = [
    BlockType.CONTAINER,
    BlockType.SECTION,
    BlockType.GRID,
    BlockType.FLEX_ROW,
    BlockType.FLEX_COLUMN,
  ].includes(block.type);

  const renderChildren = () => {
    if (!block.children || block.children.length === 0) return undefined;

    // For GRID blocks: Render children directly without wrapper (each child is a grid cell)
    if (block.type === BlockType.GRID) {
      return [...block.children]
        .sort((a, b) => a.order - b.order)
        .map((childBlock) => (
          <BlockRenderer
            key={childBlock.id}
            block={childBlock}
            isEditing={isEditing}
            onUpdate={(content, style) => onUpdateChild?.(childBlock.id, content, style)}
            onDelete={() => onDeleteChild?.(childBlock.id)}
            onAddChild={onAddChild}
            onUpdateChild={onUpdateChild}
            onDeleteChild={onDeleteChild}
            onSelect={onSelect}
            depth={depth + 1}
            isGridChild={true}
          />
        ));
    }

    // For other container blocks: Render children directly (for proper flex/layout)
    return [...block.children]
      .sort((a, b) => a.order - b.order)
      .map((childBlock) => (
        <BlockRenderer
          key={childBlock.id}
          block={childBlock}
          isEditing={isEditing}
          onUpdate={(content, style) => onUpdateChild?.(childBlock.id, content, style)}
          onDelete={() => onDeleteChild?.(childBlock.id)}
          onAddChild={onAddChild}
          onUpdateChild={onUpdateChild}
          onDeleteChild={onDeleteChild}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ));
  };

  const containerProps = {
    ...commonProps,
    onAddChild: isContainerBlock ? () => {
      console.log(`[BlockRenderer ${block.id}] onAddChild wrapper called, isContainerBlock=${isContainerBlock}, onAddChild=${!!onAddChild}`);
      onAddChild?.(block.id);
    } : undefined,
    children: isContainerBlock ? renderChildren() : undefined,
  };

  // Debug log
  if (isContainerBlock) {
    console.log(`[BlockRenderer] Rendering container block ${block.id}:`, {
      isContainerBlock,
      onAddChildDefined: !!containerProps.onAddChild,
      blockType: block.type,
    });
  }

  // Debug logging trong development mode
  useEffect(() => {
    if (isContainerBlock && process.env.NODE_ENV === 'development') {
      console.log(`[BlockRenderer ${block.id}] Container Block Debug:`, {
        blockType: block.type,
        hasChildren: !!block.children,
        childrenCount: block.children?.length || 0,
        onAddChildDefined: !!onAddChild,
        onUpdateChildDefined: !!onUpdateChild,
        onDeleteChildDefined: !!onDeleteChild,
        depth,
        children: block.children?.map(c => ({ id: c.id, type: c.type })),
      });
    }
  }, [block.id, isContainerBlock, block.children, onAddChild, onUpdateChild, onDeleteChild, depth, block.type]);

  // Render block based on type using lazy loading
  const renderBlockContent = () => {
    // Use BlockLoader for all blocks (handles lazy loading and error boundaries)
    const isContainerType = [
      BlockType.CONTAINER,
      BlockType.SECTION,
      BlockType.GRID,
      BlockType.FLEX_ROW,
      BlockType.FLEX_COLUMN,
    ].includes(block.type);

    const props = isContainerType ? containerProps : commonProps;

    return (
      <BlockLoader
        blockType={block.type}
        blockId={block.id}
        props={props}
        skeletonHeight="200px"
      />
    );
  };

  let blockContent = renderBlockContent();

  // Don't wrap grid children in selection div - it breaks grid layout
  // Grid children should render directly as grid items
  if (isGridChild) {
    return blockContent;
  }
  
  // Wrap in clickable div for selection (only in edit mode and NOT for grid children)
  if (isEditing && onSelect) {
    return (
      <div 
        onClick={handleBlockClick}
        className={`
          w-full cursor-pointer transition-all 
          ${isSelected 
            ? 'ring-2 ring-blue-500 ring-opacity-100 shadow-lg' 
            : 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50'
          }
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(block.id);
          }
        }}
      >
        {blockContent}
      </div>
    );
  }

  return blockContent;
};

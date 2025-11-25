/**
 * Nested Block Utilities
 * 
 * Helper functions for managing nested blocks in container/layout blocks
 * Supports:
 * - Adding nested blocks
 * - Removing nested blocks
 * - Reordering nested blocks
 * - Finding nested blocks
 * - Depth tracking
 */

import { PageBlock, BlockType } from '@/types/page-builder';

/**
 * Check if a block type can have nested children
 */
export const isContainerBlockType = (type: BlockType): boolean => {
  const containerTypes = [
    BlockType.CONTAINER,
    BlockType.SECTION,
    BlockType.GRID,
    BlockType.FLEX_ROW,
    BlockType.FLEX_COLUMN,
  ];
  return containerTypes.includes(type);
};

/**
 * Check if a block can have nested children
 */
export const canHaveChildren = (block: PageBlock | null | undefined): boolean => {
  if (!block) return false;
  return isContainerBlockType(block.type);
};

/**
 * Get nested children, sorted by order
 */
export const getSortedChildren = (block: PageBlock | null | undefined): PageBlock[] => {
  if (!block?.children) return [];
  return [...block.children].sort((a, b) => a.order - b.order);
};

/**
 * Find a nested block by ID within a block tree
 */
export const findNestedBlockById = (
  block: PageBlock,
  targetId: string,
  depth = 0
): { block: PageBlock; parent: PageBlock | null; depth: number } | null => {
  if (block.id === targetId) {
    return { block, parent: null, depth };
  }

  if (block.children) {
    for (const child of block.children) {
      const result = findNestedBlockById(child, targetId, depth + 1);
      if (result) {
        // Update parent reference
        if (result.parent === null) {
          result.parent = block;
        }
        return result;
      }
    }
  }

  return null;
};

/**
 * Add a new child block to a parent
 */
export const addChildBlock = (
  parent: PageBlock,
  newChild: PageBlock
): PageBlock => {
  if (!canHaveChildren(parent)) {
    console.warn(`Block type ${parent.type} cannot have children`);
    return parent;
  }

  const children = parent.children || [];
  
  // Set order to last position
  newChild.order = children.length > 0 
    ? Math.max(...children.map(c => c.order)) + 1 
    : 0;
  
  newChild.parentId = parent.id;
  newChild.depth = (parent.depth || 0) + 1;

  return {
    ...parent,
    children: [...children, newChild],
  };
};

/**
 * Remove a child block from parent
 */
export const removeChildBlock = (
  parent: PageBlock,
  childId: string
): PageBlock => {
  if (!parent.children) return parent;

  const updatedChildren = parent.children
    .filter(c => c.id !== childId)
    // Re-order remaining children
    .map((c, idx) => ({ ...c, order: idx }));

  return {
    ...parent,
    children: updatedChildren,
  };
};

/**
 * Update a child block
 */
export const updateChildBlock = (
  parent: PageBlock,
  childId: string,
  updatedChild: Partial<PageBlock>
): PageBlock => {
  if (!parent.children) return parent;

  const updatedChildren = parent.children.map(c =>
    c.id === childId ? { ...c, ...updatedChild } : c
  );

  return {
    ...parent,
    children: updatedChildren,
  };
};

/**
 * Reorder child blocks
 */
export const reorderChildren = (
  parent: PageBlock,
  orderedIds: string[]
): PageBlock => {
  if (!parent.children) return parent;

  const childMap = new Map(parent.children.map(c => [c.id, c]));
  const reorderedChildren = orderedIds
    .map(id => childMap.get(id))
    .filter((c): c is PageBlock => c !== undefined)
    .map((c, idx) => ({ ...c, order: idx }));

  return {
    ...parent,
    children: reorderedChildren,
  };
};

/**
 * Get maximum depth of a block tree
 */
export const getMaxDepth = (block: PageBlock, currentDepth = 0): number => {
  if (!block.children || block.children.length === 0) {
    return currentDepth;
  }

  const childDepths = block.children.map(child => getMaxDepth(child, currentDepth + 1));
  return Math.max(currentDepth, ...childDepths);
};

/**
 * Flatten nested blocks into a single array (useful for serialization)
 */
export const flattenBlocks = (block: PageBlock, depth = 0): (PageBlock & { depth: number })[] => {
  const flattened: (PageBlock & { depth: number })[] = [{ ...block, depth }];

  if (block.children) {
    for (const child of block.children) {
      flattened.push(...flattenBlocks(child, depth + 1));
    }
  }

  return flattened;
};

/**
 * Check if a block has any visible children
 */
export const hasVisibleChildren = (block: PageBlock | null | undefined): boolean => {
  if (!block?.children) return false;
  return block.children.some(c => c.isVisible);
};

/**
 * Get all container blocks from a list (for add child dialog filtering)
 */
export const filterContainerBlocks = (blocks: PageBlock[]): PageBlock[] => {
  return blocks.filter(b => isContainerBlockType(b.type));
};

/**
 * Validate nested block structure
 * Returns validation errors if any
 */
export const validateNestedStructure = (
  block: PageBlock,
  maxDepth = 10,
  currentDepth = 0,
  errors: string[] = []
): string[] => {
  // Check max depth
  if (currentDepth > maxDepth) {
    errors.push(`Block ${block.id} exceeds maximum nesting depth of ${maxDepth}`);
    return errors;
  }

  // Check if non-container has children
  if (block.children && block.children.length > 0 && !canHaveChildren(block)) {
    errors.push(`Non-container block ${block.id} (type: ${block.type}) has children`);
  }

  // Validate children
  if (block.children) {
    // Check duplicate IDs
    const ids = new Set<string>();
    for (const child of block.children) {
      if (ids.has(child.id)) {
        errors.push(`Duplicate child ID: ${child.id}`);
      }
      ids.add(child.id);

      // Validate child structure
      validateNestedStructure(child, maxDepth, currentDepth + 1, errors);
    }
  }

  return errors;
};

/**
 * Create a deep clone of a block with all children
 */
export const cloneBlockWithChildren = (
  block: PageBlock,
  newParentId?: string
): PageBlock => {
  const cloned: PageBlock = {
    ...block,
    id: `${block.id}-clone-${Date.now()}`,
    parentId: newParentId || block.parentId,
  };

  if (block.children) {
    cloned.children = block.children.map(child =>
      cloneBlockWithChildren(child, cloned.id)
    );
  }

  return cloned;
};

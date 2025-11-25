/**
 * useNestedBlockRenderer Hook
 * 
 * Custom hook để render nested blocks trong container/layout
 * Quản lý:
 * - Children rendering
 * - Nested update/delete handlers
 * - Reordering
 * - Drop zone management
 */

import { useCallback, useMemo } from 'react';
import { PageBlock } from '@/types/page-builder';
import { getSortedChildren, canHaveChildren } from '@/lib/nestedBlockUtils';

interface UseNestedBlockRendererProps {
  parentBlock: PageBlock | null;
  onUpdateChild?: (childId: string, content: any, style?: any) => void;
  onDeleteChild?: (childId: string) => void;
  onReorderChildren?: (parentId: string, orderedIds: string[]) => void;
  onAddChild?: (parentId: string, blockType: string) => void;
}

interface NestedBlockRenderResult {
  sortedChildren: PageBlock[];
  childrenCount: number;
  canAddChildren: boolean;
  childrenIds: string[];
  handleUpdateChild: (childId: string, content: any, style?: any) => void;
  handleDeleteChild: (childId: string) => void;
  handleReorderChildren: (orderedIds: string[]) => void;
}

/**
 * Custom hook để quản lý nested block rendering
 */
export function useNestedBlockRenderer({
  parentBlock,
  onUpdateChild,
  onDeleteChild,
  onReorderChildren,
  onAddChild,
}: UseNestedBlockRendererProps): NestedBlockRenderResult {
  // Memoize sorted children to prevent unnecessary re-renders
  const sortedChildren = useMemo(
    () => getSortedChildren(parentBlock),
    [parentBlock?.id, parentBlock?.children?.length, parentBlock?.children?.map(c => c.order).join(',')]
  );

  // Memoize children count
  const childrenCount = useMemo(() => sortedChildren.length, [sortedChildren.length]);

  // Memoize can add children check
  const canAddChildren = useMemo(() => canHaveChildren(parentBlock), [parentBlock?.type]);

  // Memoize children IDs for drag-and-drop
  const childrenIds = useMemo(() => sortedChildren.map(c => c.id), [sortedChildren]);

  // Handle child update with parent ID validation
  const handleUpdateChild = useCallback(
    (childId: string, content: any, style?: any) => {
      if (!parentBlock?.id) return;
      
      // Verify child exists in parent
      const childExists = sortedChildren.some(c => c.id === childId);
      if (!childExists) {
        console.warn(`Child block ${childId} not found in parent ${parentBlock.id}`);
        return;
      }

      onUpdateChild?.(childId, content, style);
    },
    [parentBlock?.id, sortedChildren, onUpdateChild]
  );

  // Handle child deletion with confirmation feedback
  const handleDeleteChild = useCallback(
    (childId: string) => {
      if (!parentBlock?.id) return;

      // Verify child exists
      const childExists = sortedChildren.some(c => c.id === childId);
      if (!childExists) {
        console.warn(`Child block ${childId} not found in parent ${parentBlock.id}`);
        return;
      }

      onDeleteChild?.(childId);
    },
    [parentBlock?.id, sortedChildren, onDeleteChild]
  );

  // Handle reordering with validation
  const handleReorderChildren = useCallback(
    (orderedIds: string[]) => {
      if (!parentBlock?.id) return;

      // Validate all IDs exist
      const validIds = new Set(sortedChildren.map(c => c.id));
      const invalidIds = orderedIds.filter(id => !validIds.has(id));

      if (invalidIds.length > 0) {
        console.warn(`Invalid child IDs in reorder: ${invalidIds.join(', ')}`);
        return;
      }

      if (orderedIds.length !== sortedChildren.length) {
        console.warn(
          `Reorder IDs count (${orderedIds.length}) doesn't match children count (${sortedChildren.length})`
        );
        return;
      }

      onReorderChildren?.(parentBlock.id, orderedIds);
    },
    [parentBlock?.id, sortedChildren, onReorderChildren]
  );

  return {
    sortedChildren,
    childrenCount,
    canAddChildren,
    childrenIds,
    handleUpdateChild,
    handleDeleteChild,
    handleReorderChildren,
  };
}

/**
 * Hook để detect nested drop zone
 * Trả về props cần thiết cho droppable container
 */
interface UseNestedDropZoneProps {
  parentId: string;
  isContainerType: boolean;
  isDraggedBlockId?: string;
}

interface NestedDropZoneResult {
  canDrop: boolean;
  droppableId: string;
  dropData: {
    type: 'nested-container';
    parentId: string;
  };
}

export function useNestedDropZone({
  parentId,
  isContainerType,
  isDraggedBlockId,
}: UseNestedDropZoneProps): NestedDropZoneResult {
  const canDrop = useMemo(() => {
    // Cannot drop into itself
    if (isDraggedBlockId === parentId) return false;
    // Can only drop into container types
    return isContainerType;
  }, [parentId, isContainerType, isDraggedBlockId]);

  const droppableId = useMemo(() => `nested-container-${parentId}`, [parentId]);

  const dropData = useMemo(
    () => ({
      type: 'nested-container' as const,
      parentId,
    }),
    [parentId]
  );

  return {
    canDrop,
    droppableId,
    dropData,
  };
}

/**
 * Hook để manage nested block depth limit
 */
interface UseNestedDepthCheckProps {
  currentBlock: PageBlock | null;
  maxDepth?: number;
  getDraggedBlock?: () => PageBlock | null;
}

interface NestedDepthCheckResult {
  canDropDeeper: boolean;
  currentDepth: number;
  remainingDepth: number;
  depthError: string | null;
}

export function useNestedDepthCheck({
  currentBlock,
  maxDepth = 10,
  getDraggedBlock,
}: UseNestedDepthCheckProps): NestedDepthCheckResult {
  const currentDepth = useMemo(() => currentBlock?.depth || 0, [currentBlock?.depth]);

  const remainingDepth = useMemo(() => Math.max(0, maxDepth - currentDepth), [currentDepth, maxDepth]);

  const canDropDeeper = useMemo(() => remainingDepth > 0, [remainingDepth]);

  const depthError = useMemo(() => {
    if (canDropDeeper) return null;
    return `Maximum nesting depth (${maxDepth}) reached`;
  }, [canDropDeeper, maxDepth]);

  return {
    canDropDeeper,
    currentDepth,
    remainingDepth,
    depthError,
  };
}

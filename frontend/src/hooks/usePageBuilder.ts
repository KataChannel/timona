import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useRef, useCallback } from 'react';
import { 
  GET_PAGES, 
  GET_PAGE_BY_ID, 
  CREATE_PAGE, 
  UPDATE_PAGE, 
  DELETE_PAGE,
  ADD_PAGE_BLOCK,
  UPDATE_PAGE_BLOCK,
  DELETE_PAGE_BLOCK,
  UPDATE_PAGE_BLOCKS_ORDER
} from '@/graphql/queries/pages';
import { 
  Page, 
  PaginatedPages, 
  CreatePageInput, 
  UpdatePageInput,
  CreatePageBlockInput,
  UpdatePageBlockInput,
  BulkUpdateBlockOrderInput,
  PageFiltersInput
} from '@/types/page-builder';
import { PaginationInput } from '@/types/common';
import { toast } from 'sonner';

// Constants for validation
const MAX_BLOCK_DEPTH = 5;
const MAX_BLOCKS_PER_PAGE = 100;
const MAX_CHILDREN_PER_CONTAINER = 20;
const AUTO_SAVE_DELAY = 30000; // 30 seconds

// Hook for managing pages
export const usePages = (pagination?: PaginationInput, filters?: PageFiltersInput, options?: { skip?: boolean }) => {
  const { data, loading, error, refetch } = useQuery<{ getPages: PaginatedPages }>(GET_PAGES, {
    variables: { pagination, filters },
    errorPolicy: 'all',
    skip: options?.skip || false, // Allow skipping the query if needed
  });

  return {
    pages: data?.getPages,
    loading,
    error,
    refetch
  };
};

// Hook for managing a single page
export const usePage = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ getPageById: Page }>(GET_PAGE_BY_ID, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all'
  });

  return {
    page: data?.getPageById,
    loading,
    error,
    refetch
  };
};

// Hook for page with auto-save functionality
export const usePageWithAutoSave = (id: string, onSave?: (page: Page) => Promise<void>) => {
  const { page, loading, error, refetch } = usePage(id);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedState = useRef<string>('');
  const hasChanges = useRef<boolean>(false);

  // Auto-save logic
  useEffect(() => {
    if (!page || !onSave) return;

    const currentState = JSON.stringify(page);
    
    // Check if there are changes
    if (currentState !== lastSavedState.current && lastSavedState.current !== '') {
      hasChanges.current = true;
      
      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set new auto-save timer
      autoSaveTimer.current = setTimeout(async () => {
        if (hasChanges.current) {
          try {
            await onSave(page);
            lastSavedState.current = currentState;
            hasChanges.current = false;
            toast.success('Auto-saved', { duration: 2000 });
          } catch (error) {
            toast.error('Auto-save failed');
          }
        }
      }, AUTO_SAVE_DELAY);
    } else if (lastSavedState.current === '') {
      // Initialize last saved state
      lastSavedState.current = currentState;
    }

    // Cleanup
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [page, onSave]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (!page || !onSave || !hasChanges.current) return;

    try {
      await onSave(page);
      lastSavedState.current = JSON.stringify(page);
      hasChanges.current = false;
      toast.success('Saved successfully');
    } catch (error) {
      toast.error('Save failed');
      throw error;
    }
  }, [page, onSave]);

  return {
    page,
    loading,
    error,
    refetch,
    hasUnsavedChanges: hasChanges.current,
    manualSave
  };
};

// Hook for page operations
export const usePageOperations = () => {
  const [createPage] = useMutation(CREATE_PAGE);
  const [updatePage] = useMutation(UPDATE_PAGE);
  const [deletePage] = useMutation(DELETE_PAGE);

  const handleCreatePage = async (input: CreatePageInput) => {
    try {
      console.log('Creating new page:', input);
      const { data } = await createPage({
        variables: { input },
        refetchQueries: [GET_PAGES]
      });
      toast.success('Page created successfully!');
      return data?.createPage;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create page');
      throw error;
    }
  };

  const handleUpdatePage = async (id: string, input: UpdatePageInput) => {
    try {
      const { data } = await updatePage({
        variables: { id, input },
        refetchQueries: [GET_PAGES]
      });
      toast.success('Page updated successfully!');
      return data?.updatePage;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update page');
      throw error;
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      await deletePage({
        variables: { id },
        refetchQueries: [GET_PAGES]
      });
      toast.success('Page deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete page');
      throw error;
    }
  };

  return {
    createPage: handleCreatePage,
    updatePage: handleUpdatePage,
    deletePage: handleDeletePage
  };
};

// Hook for block operations
export const useBlockOperations = (pageId: string) => {
  const [addBlock] = useMutation(ADD_PAGE_BLOCK);
  const [updateBlock] = useMutation(UPDATE_PAGE_BLOCK);
  const [deleteBlock] = useMutation(DELETE_PAGE_BLOCK);
  const [updateBlocksOrder] = useMutation(UPDATE_PAGE_BLOCKS_ORDER);

  const handleAddBlock = async (input: CreatePageBlockInput) => {
    try {
      const { data } = await addBlock({
        variables: { pageId, input },
        refetchQueries: [{ query: GET_PAGE_BY_ID, variables: { id: pageId } }]
      });
      toast.success('Block added successfully!');
      return data?.addPageBlock;
    } catch (error: any) {
      toast.error(error.message || 'Failed to add block');
      throw error;
    }
  };

  const handleUpdateBlock = async (id: string, input: UpdatePageBlockInput) => {
    try {
      const { data } = await updateBlock({
        variables: { id, input },
        refetchQueries: [{ query: GET_PAGE_BY_ID, variables: { id: pageId } }]
      });
      // Don't show toast for style updates as they happen frequently
      // Only show toast for content updates
      if (input.content !== undefined) {
        toast.success('Block updated successfully!');
      }
      return data?.updatePageBlock;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update block');
      throw error;
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteBlock({
        variables: { id },
        refetchQueries: [{ query: GET_PAGE_BY_ID, variables: { id: pageId } }]
      });
      toast.success('Block deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete block');
      throw error;
    }
  };

  const handleUpdateBlocksOrder = async (updates: BulkUpdateBlockOrderInput[]) => {
    try {
      await updateBlocksOrder({
        variables: { pageId, updates },
        refetchQueries: [{ query: GET_PAGE_BY_ID, variables: { id: pageId } }]
      });
      // Don't show toast for drag operations as they happen frequently
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder blocks');
      throw error;
    }
  };

  return {
    addBlock: handleAddBlock,
    updateBlock: handleUpdateBlock,
    deleteBlock: handleDeleteBlock,
    updateBlocksOrder: handleUpdateBlocksOrder
  };
};

// Hook for nested block operations
export const useNestedBlockOperations = (pageId: string) => {
  const { addBlock, updateBlock, deleteBlock } = useBlockOperations(pageId);
  const { page, refetch } = usePage(pageId);

  /**
   * Get all blocks in a flat array
   */
  const getAllBlocks = () => {
    if (!page?.blocks) return [];
    return flattenBlocks(page.blocks);
  };

  /**
   * Add a child block to a parent container
   */
  const addChildBlock = async (
    parentId: string,
    blockType: string,
    content: any = {},
    style: any = {}
  ) => {
    const allBlocks = getAllBlocks();
    const parentBlock = allBlocks.find(b => b.id === parentId);
    
    if (!parentBlock) {
      throw new Error('Parent block not found');
    }

    // Validation: Check if parent can accept children
    if (!isContainerBlock(parentBlock.type)) {
      toast.error('This block type cannot contain child blocks');
      throw new Error('Parent block is not a container');
    }

    // Validation: Check max depth
    const parentDepth = parentBlock.depth || 0;
    if (parentDepth >= MAX_BLOCK_DEPTH - 1) {
      toast.error(`Maximum nesting depth (${MAX_BLOCK_DEPTH} levels) reached`);
      throw new Error(`Maximum depth of ${MAX_BLOCK_DEPTH} exceeded`);
    }

    // Validation: Check max children
    const siblings = allBlocks.filter(b => b.parentId === parentId);
    if (siblings.length >= MAX_CHILDREN_PER_CONTAINER) {
      toast.error(`Maximum ${MAX_CHILDREN_PER_CONTAINER} blocks per container`);
      throw new Error(`Maximum children limit (${MAX_CHILDREN_PER_CONTAINER}) exceeded`);
    }

    // Validation: Check max total blocks
    if (allBlocks.length >= MAX_BLOCKS_PER_PAGE) {
      toast.error(`Maximum ${MAX_BLOCKS_PER_PAGE} blocks per page`);
      throw new Error(`Maximum blocks limit (${MAX_BLOCKS_PER_PAGE}) exceeded`);
    }

    // Don't calculate order - let backend handle it to avoid race conditions
    const input: CreatePageBlockInput = {
      type: blockType as any,
      content: content || {},
      style: style || {},
      parentId,
      depth: parentDepth + 1,
      // order is NOT sent, backend will auto-calculate
      isVisible: true
    };

    try {
      const result = await addBlock(input);
      await refetch();
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Move block to a different container or position
   */
  const moveBlockToContainer = async (
    blockId: string,
    newParentId: string | null,
    newOrder?: number
  ) => {
    const allBlocks = getAllBlocks();
    const block = allBlocks.find(b => b.id === blockId);
    
    if (!block) {
      throw new Error('Block not found');
    }

    // Calculate new depth
    let newDepth = 0;
    if (newParentId) {
      const newParent = allBlocks.find(b => b.id === newParentId);
      if (!newParent) {
        throw new Error('New parent block not found');
      }

      // Validation: Check if new parent can accept children
      if (!isContainerBlock(newParent.type)) {
        toast.error('Target block cannot contain child blocks');
        throw new Error('New parent is not a container');
      }

      newDepth = (newParent.depth || 0) + 1;

      // Validation: Check if move would exceed max depth
      const descendants = getBlockDescendants(blockId);
      const maxDescendantDepth = descendants.reduce((max, d) => {
        const relativeDepth = (d.depth || 0) - (block.depth || 0);
        return Math.max(max, relativeDepth);
      }, 0);

      if (newDepth + maxDescendantDepth >= MAX_BLOCK_DEPTH) {
        toast.error(`Moving this block would exceed maximum depth (${MAX_BLOCK_DEPTH} levels)`);
        throw new Error('Move would exceed maximum depth');
      }

      // Validation: Check max children in new parent
      const newSiblings = allBlocks.filter(b => b.parentId === newParentId && b.id !== blockId);
      if (newSiblings.length >= MAX_CHILDREN_PER_CONTAINER) {
        toast.error(`Target container has reached maximum ${MAX_CHILDREN_PER_CONTAINER} blocks`);
        throw new Error('Target container is full');
      }
    }

    // Calculate order if not provided
    let calculatedOrder = newOrder;
    if (calculatedOrder === undefined) {
      const siblings = allBlocks.filter(b => b.parentId === newParentId && b.id !== blockId);
      calculatedOrder = siblings.length;
    }

    const input: UpdatePageBlockInput = {
      parentId: newParentId,
      depth: newDepth,
      order: calculatedOrder
    };

    try {
      await updateBlock(blockId, input);
      
      // Update depths of all descendants
      const descendants = getBlockDescendants(blockId);
      const depthDiff = newDepth - (block.depth || 0);
      
      if (depthDiff !== 0 && descendants.length > 0) {
        for (const descendant of descendants) {
          await updateBlock(descendant.id, {
            depth: (descendant.depth || 0) + depthDiff
          });
        }
      }
      
      await refetch();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get block tree structure (nested)
   */
  const getBlockTree = () => {
    if (!page?.blocks) return [];
    return buildBlockTree(page.blocks);
  };

  /**
   * Get children of a specific block
   */
  const getBlockChildren = (blockId: string) => {
    const allBlocks = getAllBlocks();
    return allBlocks
      .filter(b => b.parentId === blockId)
      .sort((a, b) => a.order - b.order);
  };

  /**
   * Get parent of a specific block
   */
  const getBlockParent = (blockId: string) => {
    const allBlocks = getAllBlocks();
    const block = allBlocks.find(b => b.id === blockId);
    if (!block?.parentId) return null;
    return allBlocks.find(b => b.id === block.parentId) || null;
  };

  /**
   * Get all ancestors of a block (parent, grandparent, etc.)
   */
  const getBlockAncestors = (blockId: string) => {
    const ancestors = [];
    let currentBlock = getAllBlocks().find(b => b.id === blockId);
    
    while (currentBlock?.parentId) {
      const parent = getAllBlocks().find(b => b.id === currentBlock!.parentId);
      if (parent) {
        ancestors.push(parent);
        currentBlock = parent;
      } else {
        break;
      }
    }
    
    return ancestors;
  };

  /**
   * Get all descendants of a block (children, grandchildren, etc.)
   */
  const getBlockDescendants = (blockId: string) => {
    const descendants: any[] = [];
    const allBlocks = getAllBlocks();
    
    const collectDescendants = (parentId: string) => {
      const children = allBlocks.filter(b => b.parentId === parentId);
      for (const child of children) {
        descendants.push(child);
        collectDescendants(child.id);
      }
    };
    
    collectDescendants(blockId);
    return descendants;
  };

  /**
   * Check if a block can accept children (is a container)
   */
  const isContainerBlock = (blockType: string) => {
    const containerTypes = [
      'CONTAINER',
      'SECTION',
      'GRID',
      'FLEX_ROW',
      'FLEX_COLUMN'
    ];
    return containerTypes.includes(blockType);
  };

  /**
   * Duplicate a block with all its children
   */
  const duplicateBlock = async (blockId: string) => {
    const allBlocks = getAllBlocks();
    const block = allBlocks.find(b => b.id === blockId);
    
    if (!block) {
      throw new Error('Block not found');
    }

    // Create copy of the block
    const siblings = allBlocks.filter(b => b.parentId === block.parentId);
    const newOrder = siblings.length;

    const newBlockInput: CreatePageBlockInput = {
      type: block.type,
      content: JSON.parse(JSON.stringify(block.content)),
      style: JSON.parse(JSON.stringify(block.style || {})),
      parentId: block.parentId,
      depth: block.depth || 0,
      order: newOrder,
      isVisible: block.isVisible,
      config: block.config ? JSON.parse(JSON.stringify(block.config)) : undefined
    };

    try {
      const newBlock = await addBlock(newBlockInput);
      
      // Recursively duplicate children
      const children = getBlockChildren(blockId);
      if (children.length > 0 && newBlock?.id) {
        for (const child of children) {
          await duplicateBlockRecursive(child, newBlock.id);
        }
      }
      
      await refetch();
      return newBlock;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Helper: Recursively duplicate a block and its children
   */
  const duplicateBlockRecursive = async (block: any, newParentId: string) => {
    const allBlocks = getAllBlocks();
    const parent = allBlocks.find(b => b.id === newParentId);
    const siblings = allBlocks.filter(b => b.parentId === newParentId);

    const newBlockInput: CreatePageBlockInput = {
      type: block.type,
      content: JSON.parse(JSON.stringify(block.content)),
      style: JSON.parse(JSON.stringify(block.style || {})),
      parentId: newParentId,
      depth: (parent?.depth || 0) + 1,
      order: siblings.length,
      isVisible: block.isVisible,
      config: block.config ? JSON.parse(JSON.stringify(block.config)) : undefined
    };

    const newBlock = await addBlock(newBlockInput);
    
    const children = getBlockChildren(block.id);
    if (children.length > 0 && newBlock?.id) {
      for (const child of children) {
        await duplicateBlockRecursive(child, newBlock.id);
      }
    }
    
    return newBlock;
  };

  return {
    // Basic operations
    addBlock,
    updateBlock,
    deleteBlock,
    
    // Nested operations
    addChildBlock,
    moveBlockToContainer,
    duplicateBlock,
    
    // Query helpers
    getAllBlocks,
    getBlockTree,
    getBlockChildren,
    getBlockParent,
    getBlockAncestors,
    getBlockDescendants,
    isContainerBlock,
    
    // Page data
    page,
    refetch
  };
};

/**
 * Utility: Flatten nested blocks into a single array
 */
export const flattenBlocks = (blocks: any[]): any[] => {
  const result: any[] = [];
  
  const flatten = (block: any) => {
    result.push(block);
    if (block.children && block.children.length > 0) {
      block.children.forEach((child: any) => flatten(child));
    }
  };
  
  blocks.forEach(flatten);
  return result;
};

/**
 * Utility: Build nested tree structure from flat array
 */
export const unflattenBlocks = (blocks: any[]): any[] => {
  return buildBlockTree(blocks);
};

/**
 * Utility: Build tree structure from blocks
 */
const buildBlockTree = (blocks: any[]): any[] => {
  const blockMap = new Map();
  const rootBlocks: any[] = [];

  // Create a map of all blocks
  blocks.forEach(block => {
    blockMap.set(block.id, { ...block, children: [] });
  });

  // Build the tree
  blocks.forEach(block => {
    const currentBlock = blockMap.get(block.id);
    
    if (!block.parentId) {
      // Root level block
      rootBlocks.push(currentBlock);
    } else {
      // Child block
      const parent = blockMap.get(block.parentId);
      if (parent) {
        parent.children.push(currentBlock);
      }
    }
  });

  // Sort children by order
  const sortChildren = (block: any) => {
    if (block.children && block.children.length > 0) {
      block.children.sort((a: any, b: any) => a.order - b.order);
      block.children.forEach((child: any) => sortChildren(child));
    }
  };

  rootBlocks.forEach(sortChildren);
  rootBlocks.sort((a, b) => a.order - b.order);

  return rootBlocks;
};
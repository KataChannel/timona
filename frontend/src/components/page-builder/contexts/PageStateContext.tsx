'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { usePage } from '@/hooks/usePageBuilder';
import { Page, PageBlock, PageStatus } from '@/types/page-builder';

/**
 * Page State Context - Manages page and blocks state
 */
interface PageStateContextType {
  // Page state
  page: Page | null;
  editingPage: Page | null;
  isNewPageMode: boolean;
  loading: boolean;
  
  // Blocks state
  blocks: PageBlock[];
  selectedBlockId: string | null;
  selectedBlock: PageBlock | null;
  
  // Drag state
  draggedBlock: PageBlock | null;
  
  // State setters
  setEditingPage: (page: Page | null) => void;
  setBlocks: (blocks: PageBlock[]) => void;
  setSelectedBlockId: (id: string | null) => void;
  setDraggedBlock: (block: PageBlock | null) => void;
  
  // Refetch function
  refetch: () => Promise<any>;
}

const PageStateContext = createContext<PageStateContextType | undefined>(undefined);

// Export the context for direct usage in components that need optional access
export { PageStateContext };

interface PageStateProviderProps {
  children: ReactNode;
  pageId?: string;
}

export function PageStateProvider({ children, pageId }: PageStateProviderProps) {
  // Page state
  const isNewPageModeBool = !pageId;
  const [isNewPageMode, setIsNewPageMode] = useState(isNewPageModeBool);
  
  // Initialize editingPage with default values for new page mode
  const [editingPage, setEditingPageState] = useState<Page | null>(
    isNewPageModeBool ? {
      id: '',
      title: 'Untitled Page',
      slug: 'untitled-page',
      content: {},
      status: PageStatus.DRAFT,
      blocks: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : null
  );
  
  // Blocks state
  const [blocks, setBlocksState] = useState<PageBlock[]>([]);
  const [selectedBlockId, setSelectedBlockIdState] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlockState] = useState<PageBlock | null>(null);
  
  // Hooks
  // FIX: Only fetch page if we have a valid pageId (for existing pages)
  // Pass pageId directly (not || '') so Apollo knows when it changes
  const { page, loading, refetch } = usePage(pageId || '');
  
  // Memoized setters for stable references
  const setEditingPage = useCallback((page: Page | null) => {
    setEditingPageState(page);
  }, []);
  
  const setBlocks = useCallback((blocks: PageBlock[]) => {
    setBlocksState(blocks);
  }, []);
  
  const setSelectedBlockId = useCallback((id: string | null) => {
    setSelectedBlockIdState(id);
  }, []);
  
  const setDraggedBlock = useCallback((block: PageBlock | null) => {
    setDraggedBlockState(block);
  }, []);
  
  // Track pageId changes and refetch when it changes
  useEffect(() => {
    if (pageId) {
      setIsNewPageMode(false);
      // Refetch when pageId changes
      refetch();
    } else {
      setIsNewPageMode(true);
    }
  }, [pageId, refetch]);
  
  // Initialize editing page when page loads (for existing pages)
  useEffect(() => {
    if (page && !isNewPageMode) {
      setEditingPageState(page);
    }
  }, [page, isNewPageMode]);
  
  // Initialize blocks from page
  useEffect(() => {
    if (page?.blocks) {
      setBlocksState(page.blocks as PageBlock[]);
    }
  }, [page?.blocks]);
  
  // Calculate selected block with useMemo for performance
  const selectedBlock = useMemo(() => {
    if (!selectedBlockId) return null;
    
    const findBlock = (blocks: PageBlock[]): PageBlock | null => {
      for (const block of blocks) {
        if (block.id === selectedBlockId) return block;
        if (block.children) {
          const found = findBlock(block.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findBlock(blocks);
  }, [selectedBlockId, blocks]);
  
  const value: PageStateContextType = {
    page: page || null,
    editingPage,
    isNewPageMode,
    loading,
    blocks,
    selectedBlockId,
    selectedBlock,
    draggedBlock,
    setEditingPage,
    setBlocks,
    setSelectedBlockId,
    setDraggedBlock,
    refetch,
  };
  
  return (
    <PageStateContext.Provider value={value}>
      {children}
    </PageStateContext.Provider>
  );
}

export function usePageState() {
  const context = useContext(PageStateContext);
  if (context === undefined) {
    // Return default values instead of throwing during SSR or initial render
    if (typeof window === 'undefined') {
      return {
        page: null,
        editingPage: null,
        isNewPageMode: true,
        loading: false,
        blocks: [],
        selectedBlockId: null,
        selectedBlock: null,
        draggedBlock: null,
        setEditingPage: () => {},
        setBlocks: () => {},
        setSelectedBlockId: () => {},
        setDraggedBlock: () => {},
        refetch: async () => {},
      } as PageStateContextType;
    }
    throw new Error(
      'usePageState must be used within a PageStateProvider. ' +
      'Make sure your component is wrapped with <PageBuilderProvider>'
    );
  }
  return context;
}

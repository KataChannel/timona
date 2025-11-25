'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePageOperations, useBlockOperations, useNestedBlockOperations } from '@/hooks/usePageBuilder';
import { BlockType, PageBlock, CreatePageInput, UpdatePageInput } from '@/types/page-builder';
import { pageBuilderLogger, LOG_OPERATIONS } from '../utils/pageBuilderLogger';
import { usePageState } from './PageStateContext';
import { useTemplate } from './TemplateContext';
import { useUIState } from './UIStateContext';
import { useHistory } from './HistoryContext';
import { BlockTemplate } from '@/data/blockTemplates';

/**
 * Default content for each block type
 */
export const DEFAULT_BLOCK_CONTENT = {
  [BlockType.TEXT]: { content: 'Enter your text here...', style: {} },
  [BlockType.IMAGE]: { src: '', alt: '', style: {} },
  [BlockType.HERO]: { 
    title: 'Hero Title', 
    subtitle: 'Hero subtitle text', 
    backgroundImage: '', 
    style: {} 
  },
  [BlockType.BUTTON]: { 
    text: 'Click me', 
    link: '#', 
    variant: 'primary', 
    style: {} 
  },
  [BlockType.CAROUSEL]: {
    slides: [
      {
        id: '1',
        title: 'Slide 1',
        subtitle: 'Welcome to our carousel',
        description: 'This is the first slide',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop',
        cta: { text: 'Learn More', link: '#' },
        badge: 'NEW',
        bgColor: 'bg-gradient-to-r from-blue-500 to-purple-600'
      }
    ],
    autoPlay: true,
    autoPlayInterval: 5000,
    showIndicators: true,
    showArrows: true,
    loop: true,
    style: {}
  },
  [BlockType.TEAM]: { title: 'Our Team', members: [], style: {} },
  [BlockType.STATS]: { title: 'Our Stats', stats: [], style: {} },
  [BlockType.CONTACT_INFO]: { email: '', phone: '', address: '', style: {} },
  [BlockType.DIVIDER]: { thickness: 1, color: '#e5e7eb', style: {} },
  [BlockType.SPACER]: { height: 40, style: {} },
  [BlockType.CONTAINER]: { 
    maxWidth: '1200px',
    padding: '20px',
    backgroundColor: 'transparent',
    style: {} 
  },
  [BlockType.SECTION]: { 
    backgroundColor: '#ffffff',
    padding: '40px 20px',
    style: {} 
  },
  [BlockType.GRID]: { columns: 2, gap: '20px', style: {} },
  [BlockType.FLEX_ROW]: { 
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '10px',
    style: {} 
  },
  [BlockType.FLEX_COLUMN]: { 
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '10px',
    style: {} 
  },
  [BlockType.DYNAMIC]: { 
    // Initialize with a random sample template for better user experience
    componentType: 'template',
    templateId: 'sample-template',
    templateName: 'Sample Template',
    // Will be replaced with actual template on block add
    template: '<div class="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center"><h3 class="text-lg font-semibold mb-2">Dynamic Block</h3><p class="text-gray-600">Loading sample template...</p></div>',
    dataSource: { type: 'static', data: {} },
    variables: {},
    style: {} 
  },
  [BlockType.PRODUCT_LIST]: {
    title: 'Sản phẩm nổi bật',
    subtitle: 'Khám phá các sản phẩm chất lượng cao',
    limit: 12,
    filters: { isFeatured: true },
    layout: 'grid',
    columns: 3,
    showPrice: true,
    showCategory: true,
    showDescription: false,
    showAddToCart: true,
    cardVariant: 'default',
    style: {}
  },
  [BlockType.PRODUCT_DETAIL]: {
    productSlug: '',
    showGallery: true,
    showDescription: true,
    showSpecs: true,
    showReviews: false,
    showRelated: false,
    layout: 'default',
    style: {}
  },
  [BlockType.VIDEO]: { url: '', title: '', autoplay: false, controls: true, muted: false, loop: false, style: {} },
  [BlockType.SEARCH]: { 
    placeholder: 'Tìm kiếm...', 
    searchType: 'global',
    showFilters: true,
    showResults: true,
    style: {} 
  },
  [BlockType.BOOKMARK]: {
    bookmarks: [],
    displayMode: 'list',
    showCategories: true,
    allowEdit: true,
    style: {}
  },
  [BlockType.BLOG_CAROUSEL]: {
    title: 'Tin tức nổi bật',
    filterType: 'all',
    itemsToShow: 6,
    showViewAllButton: true,
    viewAllLink: '/tin-tuc',
    autoplay: false,
    autoplayDelay: 5000,
    loop: true,
    showNavigation: true,
    showExcerpt: true,
    showAuthor: true,
    showDate: true,
    showCategory: true,
    responsive: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
    style: {}
  },
} as const;

/**
 * Page Actions Context - Manages all CRUD operations
 */
interface PageActionsContextType {
  // Page operations
  handlePageSave: () => Promise<void>;
  handlePageDelete: () => Promise<void>;
  
  // Block operations
  handleAddBlock: (blockType: BlockType) => Promise<void>;
  handleAddTemplateBlock: (templateConfig: {
    templateId: string;
    templateName: string;
    template: string;
    dataSource: any;
    variables: any;
  }) => Promise<void>;
  handleBlockUpdate: (blockId: string, content: any, style?: any) => Promise<void>;
  handleBlockDelete: (blockId: string) => Promise<void>;
  handleBlockCopy: (block: PageBlock) => Promise<void>; // 🆕 Copy block
  handleBlocksReorder: (newBlocks: PageBlock[]) => Promise<void>;
  handleSelectBlock: (blockId: string | null) => void;
  handleUpdateBlockStyle: (blockId: string, style: any) => Promise<void>;
  
  // History operations
  handleUndo: () => Promise<void>;
  handleRedo: () => Promise<void>;
  
  // Nested block operations
  handleAddChild: (parentId: string) => void;
  handleAddChildBlock: (parentId: string, blockType: BlockType) => Promise<void>;
  handleCloseAddChildDialog: () => void;
  
  // Template operations
  handleApplyTemplate: (template: BlockTemplate) => Promise<void>;
  
  // Drag and drop
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => Promise<void>;
}

const PageActionsContext = createContext<PageActionsContextType | undefined>(undefined);

interface PageActionsProviderProps {
  children: ReactNode;
  pageId?: string;
}

export function PageActionsProvider({ children, pageId }: PageActionsProviderProps) {
  const router = useRouter();
  const pageState = usePageState();
  const templateState = useTemplate();
  const uiState = useUIState();
  const history = useHistory();
  
  const { createPage, updatePage, deletePage } = usePageOperations();
  // Initialize with pageId from props, but fall back to state's page ID
  const effectivePageId = pageId || pageState.page?.id || '';
  const { addBlock, updateBlock, deleteBlock, updateBlocksOrder } = useBlockOperations(effectivePageId);
  const nestedOps = useNestedBlockOperations(effectivePageId);
  
  // Page operations
  const handlePageSave = useCallback(async () => {
    try {
      const { editingPage, isNewPageMode, blocks, refetch, setEditingPage } = pageState;
      
      if (!editingPage) {
        toast.error('No page to save');
        return;
      }
      
      if (isNewPageMode) {
        const input: CreatePageInput = {
          title: editingPage.title,
          slug: editingPage.slug,
          content: editingPage.content || {},
          status: editingPage.status,
          seoTitle: editingPage.seoTitle,
          seoDescription: editingPage.seoDescription,
          seoKeywords: editingPage.seoKeywords || [],
          isHomepage: editingPage.isHomepage || false,
        };
        
        const result = await createPage(input);
        pageBuilderLogger.success(LOG_OPERATIONS.PAGE_CREATE, 'Page created successfully', result);
        toast.success('Page created successfully!');
        
        if (result?.data?.createPage) {
          const newPage = result.data.createPage;
          setEditingPage(newPage);
          // After creating a new page, redirect to the new page's editor
          if (newPage?.id) {
            router.push(`/admin/pagebuilder/${newPage.id}`);
          }
          // After creating a new page, we've exited "new page mode" since we now have an ID
          // Do not call refetch here since it will try to query with the old empty pageId
          // The page state will be automatically updated through the context
        }
      } else {
        const input: UpdatePageInput = {
          title: editingPage.title,
          slug: editingPage.slug,
          content: editingPage.content || {},
          status: editingPage.status,
          seoTitle: editingPage.seoTitle,
          seoDescription: editingPage.seoDescription,
          seoKeywords: editingPage.seoKeywords || [],
          isHomepage: editingPage.isHomepage || false,
        };
        
        await updatePage(editingPage.id, input);
        pageBuilderLogger.success(LOG_OPERATIONS.PAGE_UPDATE, 'Page updated successfully', { pageId: editingPage.id });
        toast.success('Page saved successfully!');
        
        // For existing pages, refetch to sync state
        await refetch();
      }
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.PAGE_UPDATE, 'Failed to save page', { error });
      toast.error(error?.message || 'Failed to save page');
    }
  }, [pageState, createPage, updatePage, router]);
  
  const handlePageDelete = useCallback(async () => {
    try {
      const { page } = pageState;
      if (!page?.id) return;
      
      await deletePage(page.id);
      pageBuilderLogger.success(LOG_OPERATIONS.PAGE_DELETE, 'Page deleted', { pageId: page.id });
      toast.success('Page deleted successfully!');
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.PAGE_DELETE, 'Failed to delete page', { error });
      toast.error(error?.message || 'Failed to delete page');
    }
  }, [pageState, deletePage]);
  
  // Block operations
  const handleAddBlock = useCallback(async (blockType: BlockType) => {
    try {
      const { page, refetch, blocks } = pageState;
      
      if (!page?.id) {
        toast.error('Please create a page first');
        console.warn('[PageBuilder] Cannot add block: no page ID', { page });
        return;
      }
      
      let defaultContent = DEFAULT_BLOCK_CONTENT[blockType as keyof typeof DEFAULT_BLOCK_CONTENT] || {};
      
      // For Dynamic Blocks, start with basic empty template
      // User will choose template in the dialog
      if (blockType === BlockType.DYNAMIC) {
        defaultContent = {
          componentType: 'template',
          templateId: null,
          templateName: 'New Dynamic Block',
          template: '<div class="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center"><h3 class="text-lg font-semibold mb-2">Dynamic Block</h3><p class="text-gray-600">Select a template or paste your HTML template here.</p></div>',
          dataSource: { type: 'static', data: {} },
          variables: {},
          style: {},
        } as any;
        console.log('[PageBuilder] Dynamic Block created - user will pick template');
      }
      
      // Don't send order - let backend calculate it to avoid race conditions
      const input = {
        type: blockType,
        content: defaultContent,
        // order is NOT sent, backend will auto-calculate based on block count
      };
      
      console.log('[PageBuilder] Adding block:', { blockType, pageId: page.id });
      
      const result = await addBlock(input);
      pageBuilderLogger.success(LOG_OPERATIONS.BLOCK_CREATE, 'Block added', { blockType });
      toast.success(blockType === BlockType.DYNAMIC ? '✨ Dynamic Block added - pick a template!' : 'Block added successfully!');
      
      console.log('[PageBuilder] Block added successfully:', result);
      await refetch();
      
      // Push to history after successful add
      const newBlocks = await refetch();
      if (newBlocks?.data?.page?.blocks) {
        history.pushHistory(newBlocks.data.page.blocks, `Added ${blockType} block`);
        
        // Scroll to the newly added block (at the bottom)
        setTimeout(() => {
          const blockElements = document.querySelectorAll('[data-block-id]');
          if (blockElements.length > 0) {
            const lastBlock = blockElements[blockElements.length - 1];
            lastBlock.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 300); // Wait for DOM update
      }
    } catch (error: any) {
      console.error('[PageBuilder] Block add error:', error);
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_CREATE, 'Failed to add block', { error });
      toast.error(error?.message || 'Failed to add block');
    }
  }, [pageState, addBlock, history]);
  
  const handleAddTemplateBlock = useCallback(async (templateConfig: any) => {
    try {
      const { page, refetch } = pageState;
      
      if (!page?.id) {
        toast.error('Please create a page first');
        return;
      }
      
      const input = {
        type: BlockType.DYNAMIC,
        content: {
          ...DEFAULT_BLOCK_CONTENT[BlockType.DYNAMIC],
          ...templateConfig,
        },
        // order is NOT sent, backend will auto-calculate
      };
      
      await addBlock(input);
      pageBuilderLogger.success(LOG_OPERATIONS.BLOCK_CREATE, 'Template block added', templateConfig);
      toast.success('Template block added!');
      await refetch();
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_CREATE, 'Failed to add template block', { error });
      toast.error(error?.message || 'Failed to add template block');
    }
  }, [pageState, addBlock]);
  
  const handleBlockUpdate = useCallback(async (blockId: string, content: any, style?: any) => {
    try {
      const input: any = { content };
      if (style !== undefined) {
        input.style = style;
      }
      
      // If content has config property, extract and save it separately
      if (content?.config !== undefined) {
        input.config = content.config;
      }
      
      await updateBlock(blockId, input);
      pageBuilderLogger.debug(LOG_OPERATIONS.BLOCK_UPDATE, 'Block updated', { blockId, content, style });
      const result = await pageState.refetch();
      
      // Push to history after successful update
      if (result?.data?.page?.blocks) {
        history.pushHistory(result.data.page.blocks, `Updated block`);
      }
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_UPDATE, 'Failed to update block', { error });
      toast.error(error?.message || 'Failed to update block');
    }
  }, [updateBlock, pageState, history]);
  
  const handleBlockDelete = useCallback(async (blockId: string) => {
    try {
      await deleteBlock(blockId);
      pageBuilderLogger.success(LOG_OPERATIONS.BLOCK_DELETE, 'Block deleted', { blockId });
      toast.success('Block deleted!');
      const result = await pageState.refetch();
      
      // Push to history after successful delete
      if (result?.data?.page?.blocks) {
        history.pushHistory(result.data.page.blocks, `Deleted block`);
      }
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_DELETE, 'Failed to delete block', { error });
      toast.error(error?.message || 'Failed to delete block');
    }
  }, [deleteBlock, pageState, history]);
  
  const handleBlockCopy = useCallback(async (block: PageBlock) => {
    try {
      const { page, blocks, refetch, setBlocks } = pageState;
      
      if (!page?.id) {
        toast.error('No page selected');
        return;
      }
      
      // Find the position of the original block
      const originalIndex = blocks.findIndex(b => b.id === block.id);
      if (originalIndex === -1) {
        toast.error('Block not found');
        return;
      }
      
      // Create a copy of the block with deep clone
      const copiedContent = JSON.parse(JSON.stringify(block.content));
      const copiedStyle = block.style ? JSON.parse(JSON.stringify(block.style)) : undefined;
      
      const input = {
        type: block.type,
        content: copiedContent,
        style: copiedStyle,
      };
      
      // Add the new block
      await addBlock(input);
      
      pageBuilderLogger.success(LOG_OPERATIONS.BLOCK_ADD, 'Block copied', { 
        originalId: block.id, 
        type: block.type 
      });
      
      // Refetch to get the new block
      const result = await refetch();
      
      if (result?.data?.page?.blocks) {
        const updatedBlocks = result.data.page.blocks;
        
        // Find the newly created block (should be at the end)
        const newBlock = updatedBlocks[updatedBlocks.length - 1];
        
        // Reorder: move new block right after the original
        const reorderedBlocks = [...updatedBlocks];
        const newBlockAtEnd = reorderedBlocks.pop(); // Remove from end
        
        if (newBlockAtEnd) {
          // Insert right after the original block (originalIndex + 1)
          reorderedBlocks.splice(originalIndex + 1, 0, newBlockAtEnd);
          
          // Update order property for all blocks
          const finalBlocks = reorderedBlocks.map((b, index) => ({
            ...b,
            order: index,
          }));
          
          // Update local state first
          setBlocks(finalBlocks);
          
          // Update order on server
          const updates = finalBlocks.map((b, index) => ({
            id: b.id,
            order: index,
          }));
          await updateBlocksOrder(updates);
          
          pageBuilderLogger.debug(LOG_OPERATIONS.BLOCK_REORDER, 'Blocks reordered after copy', { 
            count: finalBlocks.length 
          });
          
          // Final refetch to ensure consistency
          await refetch();
          
          // Scroll to the newly copied block
          setTimeout(() => {
            const blockElement = document.querySelector(`[data-block-id="${newBlockAtEnd.id}"]`);
            if (blockElement) {
              blockElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              });
              
              // Add highlight effect
              blockElement.classList.add('ring-4', 'ring-green-400');
              setTimeout(() => {
                blockElement.classList.remove('ring-4', 'ring-green-400');
              }, 2000);
            }
          }, 300);
        }
        
        // Push to history
        history.pushHistory(updatedBlocks, `Copied ${block.type} block`);
      }
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_ADD, 'Failed to copy block', { error });
      toast.error(error?.message || 'Failed to copy block');
    }
  }, [addBlock, updateBlocksOrder, pageState, history]);
  
  const handleBlocksReorder = useCallback(async (newBlocks: PageBlock[]) => {
    try {
      const { page, setBlocks, refetch } = pageState;
      
      if (!page?.id) return;
      
      setBlocks(newBlocks);
      
      const updates = newBlocks.map((b, index) => ({
        id: b.id,
        order: index,
      }));
      await updateBlocksOrder(updates);
      
      pageBuilderLogger.debug(LOG_OPERATIONS.BLOCK_REORDER, 'Blocks reordered', { count: newBlocks.length });
      const result = await refetch();
      
      // Push to history after successful reorder
      if (result?.data?.page?.blocks) {
        history.pushHistory(result.data.page.blocks, `Reordered blocks`);
      }
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_REORDER, 'Failed to reorder blocks', { error });
      toast.error('Failed to reorder blocks');
    }
  }, [pageState, updateBlocksOrder]);
  
  const handleSelectBlock = useCallback((blockId: string | null) => {
    pageState.setSelectedBlockId(blockId);
  }, [pageState]);
  
  const handleUpdateBlockStyle = useCallback(async (blockId: string, style: any) => {
    try {
      const { refetch } = pageState;
      
      const input: any = { style };
      await updateBlock(blockId, input);
      pageBuilderLogger.debug(LOG_OPERATIONS.BLOCK_STYLE_UPDATE, 'Block style updated', { blockId, style });
      const result = await refetch();
      
      // Push to history after successful style update
      if (result?.data?.page?.blocks) {
        history.pushHistory(result.data.page.blocks, `Updated block style`);
      }
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_STYLE_UPDATE, 'Failed to update style', { error });
      toast.error('Failed to update style');
    }
  }, [pageState, updateBlock, history]);
  
  // History operations
  const handleUndo = useCallback(async () => {
    try {
      const previousBlocks = history.undo();
      
      if (!previousBlocks) {
        toast.info('Nothing to undo');
        return;
      }
      
      // Update blocks state
      pageState.setBlocks(previousBlocks);
      
      // Sync with backend
      const updates = previousBlocks.map((b, index) => ({
        id: b.id,
        order: index,
      }));
      await updateBlocksOrder(updates);
      await pageState.refetch();
      
      const action = history.getUndoAction();
      toast.success(`Undo: ${action || 'Previous action'}`);
      pageBuilderLogger.debug('UNDO', 'Undo performed', { action });
    } catch (error: any) {
      pageBuilderLogger.error('UNDO', 'Failed to undo', { error });
      toast.error('Failed to undo');
    }
  }, [history, pageState, updateBlocksOrder]);
  
  const handleRedo = useCallback(async () => {
    try {
      const nextBlocks = history.redo();
      
      if (!nextBlocks) {
        toast.info('Nothing to redo');
        return;
      }
      
      // Update blocks state
      pageState.setBlocks(nextBlocks);
      
      // Sync with backend
      const updates = nextBlocks.map((b, index) => ({
        id: b.id,
        order: index,
      }));
      await updateBlocksOrder(updates);
      await pageState.refetch();
      
      const action = history.getRedoAction();
      toast.success(`Redo: ${action || 'Next action'}`);
      pageBuilderLogger.debug('REDO', 'Redo performed', { action });
    } catch (error: any) {
      pageBuilderLogger.error('REDO', 'Failed to redo', { error });
      toast.error('Failed to redo');
    }
  }, [history, pageState, updateBlocksOrder]);
  
  // Nested block operations
  const handleAddChild = useCallback((parentId: string) => {
    console.log(`[PageActionsContext] handleAddChild called with parentId:`, parentId);
    // Use atomic operation to set both states together
    uiState.openAddChildDialog(parentId);
    console.log(`[PageActionsContext] openAddChildDialog called`);
  }, [uiState]);
  
  const handleAddChildBlock = useCallback(async (parentId: string, blockType: BlockType) => {
    try {
      const { refetch } = pageState;
      
      const defaultContent = DEFAULT_BLOCK_CONTENT[blockType as keyof typeof DEFAULT_BLOCK_CONTENT] || {};
      
      await nestedOps.addChildBlock(
        parentId,
        blockType,
        defaultContent,
        {}
      );
      
      pageBuilderLogger.success(LOG_OPERATIONS.BLOCK_CREATE, 'Child block added', { parentId, blockType });
      toast.success('Child block added!');
      
      // Use atomic close operation
      uiState.closeAddChildDialog();
      
      await refetch();
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.BLOCK_CREATE, 'Failed to add child block', { error });
      toast.error('Failed to add child block');
    }
  }, [pageState, uiState, nestedOps]);
  
  const handleCloseAddChildDialog = useCallback(() => {
    uiState.closeAddChildDialog();
  }, [uiState]);
  
  // Template operations
  const handleApplyTemplate = useCallback(async (template: BlockTemplate) => {
    try {
      const { page, editingPage, isNewPageMode, refetch } = pageState;
      const { setIsApplyingTemplate, setShowPreviewModal } = templateState;
      
      if (!editingPage?.id && !isNewPageMode) {
        toast.error('Please create a page first');
        return;
      }
      
      setIsApplyingTemplate(true);
      
      const currentPageId = page?.id || editingPage?.id;
      if (!currentPageId) {
        toast.error('Page ID not found');
        return;
      }
      
      for (const block of template.blocks) {
        await addBlock({
          type: block.type,
          content: block.content,
          order: block.order,
        });
      }
      
      pageBuilderLogger.success(LOG_OPERATIONS.TEMPLATE_APPLY, 'Template applied', { templateId: template.id });
      toast.success(`Template "${template.name}" applied!`);
      
      setShowPreviewModal(false);
      await refetch();
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.TEMPLATE_APPLY, 'Failed to apply template', { error });
      toast.error('Failed to apply template');
    } finally {
      templateState.setIsApplyingTemplate(false);
    }
  }, [pageState, templateState, addBlock]);
  
  // Drag and drop
  const handleDragStart = useCallback((event: any) => {
    const { active } = event;
    const { blocks, setDraggedBlock } = pageState;
    
    // Debug: Log the entire active object structure
    console.log('[PageBuilder] handleDragStart full active object:', active);
    console.log('[PageBuilder] handleDragStart active.data:', active.data);
    
    const dragType = active.data?.type;
    const blockType = active.data?.blockType;
    
    console.log('[PageBuilder] Drag started:', {
      activeId: active.id,
      activeType: dragType,
      activeBlockType: blockType,
      fullData: active.data,
    });
    
    // Handle existing block drag
    if (dragType !== 'new-block') {
      const draggedBlock = blocks.find(b => b.id === active.id);
      if (draggedBlock) {
        setDraggedBlock(draggedBlock);
      }
    }
    // For new blocks from LeftPanel, no need to set draggedBlock
  }, [pageState]);
  
  const handleDragEnd = useCallback(async (event: any) => {
    const { active, over } = event;
    const { blocks, setDraggedBlock } = pageState;
    
    // Debug: Log full event structure
    console.log('[PageBuilder] handleDragEnd full event:', event);
    console.log('[PageBuilder] handleDragEnd active:', active);
    console.log('[PageBuilder] handleDragEnd over:', over);
    
    const dragType = active.data?.type;
    const blockType = active.data?.blockType;
    
    console.log('[PageBuilder] Drag ended:', {
      activeId: active.id,
      activeType: dragType,
      activeBlockType: blockType,
      overId: over?.id,
      overType: over?.data?.type,
    });
    
    setDraggedBlock(null);
    
    if (!over) {
      console.warn('[PageBuilder] No drop target');
      return;
    }
    
    // Handle new block from LeftPanel
    // Check if the draggable ID starts with 'element-' which indicates a library element
    const isLibraryElement = active.id?.toString().startsWith('element-');
    
    if (isLibraryElement || dragType === 'new-block') {
      // Extract BlockType from active.id if data is missing
      // Format: 'element-TEXT', 'element-CAROUSEL', etc.
      let blockTypeValue = blockType;
      
      if (!blockTypeValue && isLibraryElement) {
        const typeStr = active.id.replace('element-', '');
        // Try to find the BlockType enum value by name
        blockTypeValue = (BlockType as any)[typeStr];
        console.log('[PageBuilder] Extracted BlockType from ID:', { typeStr, blockTypeValue });
      }
      
      console.log('[PageBuilder] New block detected:', { blockTypeValue, targetId: over.id, dragType, isLibraryElement });
      
      // Only accept drop on canvas-droppable
      if (blockTypeValue !== undefined && over.id === 'canvas-droppable') {
        console.log('[PageBuilder] Adding new block:', blockTypeValue);
        await handleAddBlock(blockTypeValue);
      } else {
        console.warn('[PageBuilder] New block rejected:', { 
          reason: over.id !== 'canvas-droppable' ? 'wrong-target' : 'no-blocktype',
          targetId: over.id,
          blockTypeValue,
          isDefined: blockTypeValue !== undefined,
        });
      }
      return;
    }
    
    // Handle existing block reorder
    if (active.id === over.id) {
      console.log('[PageBuilder] Same block, no reorder');
      return;
    }
    
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      console.warn('[PageBuilder] Invalid block indices:', { oldIndex, newIndex });
      return;
    }
    
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(oldIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    
    handleBlocksReorder(newBlocks);
  }, [pageState, handleBlocksReorder, handleAddBlock]);
  
  const value: PageActionsContextType = {
    handlePageSave,
    handlePageDelete,
    handleAddBlock,
    handleAddTemplateBlock,
    handleBlockUpdate,
    handleBlockDelete,
    handleBlockCopy,
    handleBlocksReorder,
    handleSelectBlock,
    handleUpdateBlockStyle,
    handleUndo,
    handleRedo,
    handleAddChild,
    handleAddChildBlock,
    handleCloseAddChildDialog,
    handleApplyTemplate,
    handleDragStart,
    handleDragEnd,
  };
  
  return (
    <PageActionsContext.Provider value={value}>
      {children}
    </PageActionsContext.Provider>
  );
}

export function usePageActions() {
  const context = useContext(PageActionsContext);
  if (context === undefined) {
    // Return default values instead of throwing during SSR or initial render
    if (typeof window === 'undefined') {
      return {
        handlePageSave: async () => {},
        handlePageDelete: async () => {},
        handleAddBlock: async () => {},
        handleAddTemplateBlock: async () => {},
        handleBlockUpdate: async () => {},
        handleBlockDelete: async () => {},
        handleBlockCopy: async () => {},
        handleBlocksReorder: async () => {},
        handleSelectBlock: () => {},
        handleUpdateBlockStyle: async () => {},
        handleUndo: async () => {},
        handleRedo: async () => {},
        handleAddChild: () => {},
        handleAddChildBlock: async () => {},
        handleCloseAddChildDialog: () => {},
        handleApplyTemplate: async () => {},
        handleDragStart: () => {},
        handleDragEnd: async () => {},
      } as PageActionsContextType;
    }
    throw new Error(
      'usePageActions must be used within a PageActionsProvider. ' +
      'Make sure your component is wrapped with <PageBuilderProvider>'
    );
  }
  return context;
}

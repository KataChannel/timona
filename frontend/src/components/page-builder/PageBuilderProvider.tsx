'use client';

import React, { ReactNode } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  PageStateProvider,
  UIStateProvider,
  TemplateProvider,
  PageActionsProvider,
  HistoryProvider,
  usePageState,
  usePageActions,
  useUIState,
  useTemplate,
  useHistory,
} from './contexts';
import ErrorBoundary from './ErrorBoundary';
import { pageBuilderLogger } from './utils/pageBuilderLogger';

/**
 * PageBuilder Provider Props
 */
interface PageBuilderProviderProps {
  children: ReactNode;
  pageId?: string;
}

/**
 * Refactored PageBuilder Provider Component
 * 
 * Now uses 4 separate contexts for better organization:
 * - PageStateContext: Page and blocks state
 * - UIStateContext: UI state (modals, dialogs)
 * - TemplateContext: Template operations
 * - PageActionsContext: All CRUD operations
 * 
 * Wrapped with Single Error Boundary for robust error handling
 */
export function PageBuilderProvider({ children, pageId }: PageBuilderProviderProps) {
  return (
    <ErrorBoundary>
      <PageStateProvider pageId={pageId}>
        <UIStateProvider>
          <TemplateProvider>
            <HistoryProvider maxHistorySize={50}>
              <PageActionsProvider pageId={pageId}>
                <DndContextWrapper>
                  {children}
                </DndContextWrapper>
              </PageActionsProvider>
            </HistoryProvider>
          </TemplateProvider>
        </UIStateProvider>
      </PageStateProvider>
    </ErrorBoundary>
  );
}

/**
 * DnD Context Wrapper
 * Handles drag and drop functionality
 * 
 * Important: handleDragEnd is async but DndContext onDragEnd doesn't wait for async.
 * We wrap it to ensure proper handling of the async operations.
 */
function DndContextWrapper({ children }: { children: ReactNode }) {
  const { draggedBlock } = usePageState();
  const { handleDragStart, handleDragEnd: handleDragEndAsync } = usePageActions();

  // Wrap async handler since DndContext doesn't wait for async callbacks
  // Fire and forget - let the async operation complete in the background
  const handleDragEnd = React.useCallback((event: any) => {
    handleDragEndAsync(event).catch((error: any) => {
      pageBuilderLogger.error('DRAG_END', 'Error in drag and drop operation', { event, error });
    });
  }, [handleDragEndAsync]);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      {children}
      
      {/* Drag Overlay - Visual feedback during drag */}
      {/* Memoized to prevent unnecessary re-renders and memory leaks */}
      <DragOverlayContent draggedBlock={draggedBlock} />
    </DndContext>
  );
}

/**
 * Memoized DragOverlay Content Component
 * Prevents memory leaks and unnecessary re-renders during drag operations
 */
const DragOverlayContent = React.memo(function DragOverlayContent({ draggedBlock }: { draggedBlock: any }) {
  return (
    <DragOverlay dropAnimation={null}>
      {draggedBlock ? (
        <div className="animate-pulse pointer-events-none">
          <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xl border-2 border-blue-300 text-white min-w-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <GripVertical className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold block">Moving Block</span>
                <span className="text-xs opacity-90">{draggedBlock.type}</span>
              </div>
              <div className="ml-auto text-2xl">📦</div>
            </div>
          </Card>
        </div>
      ) : null}
    </DragOverlay>
  );
});
// Export individual hooks for better tree-shaking and clear API
export { usePageState, useUIState, useTemplate, usePageActions, useHistory } from './contexts';

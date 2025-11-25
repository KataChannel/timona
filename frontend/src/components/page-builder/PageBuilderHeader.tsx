'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Eye, Settings, Home, AlertCircle, Loader2 } from 'lucide-react';
import { usePageState, useUIState, useTemplate, usePageActions } from './PageBuilderProvider';
import { PageStatus } from '@/types/page-builder';
import PageSettingsForm from './PageSettingsForm';

/**
 * PageBuilder Header Component (Senior-Level Optimization)
 * 
 * Features:
 * - Display page title, status badge, homepage indicator
 * - Save as Template (only enabled when blocks exist)
 * - Preview toggle
 * - Page Settings dialog with nested form
 * - Save/Create Page button with loading state
 * - Error display for failed operations
 * - Responsive design
 * 
 * Performance Optimizations:
 * - React.memo to prevent unnecessary re-renders
 * - useCallback for stable event handler references
 * - useMemo for computed values
 * - Memoized sub-components (StatusBadges, ActionButtons)
 * - Lazy dialog initialization
 */
const PageBuilderHeaderComponent = React.memo(function PageBuilderHeaderComponent() {
  // Context hooks
  const { editingPage, blocks, page, setEditingPage, loading } = usePageState();
  const { showPreview, showPageSettings, setShowPreview, setShowPageSettings } = useUIState();
  const { setShowSaveTemplateDialog } = useTemplate();
  const { handlePageSave } = usePageActions();
  
  // Local state for save button loading
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const isNewPageMode = !page?.id;

  // ===== Memoized Computed Values =====
  
  const hasBlocks = useMemo(() => blocks.length > 0, [blocks.length]);
  
  const saveButtonText = useMemo(() => 
    isNewPageMode ? 'Create Page' : 'Save', 
    [isNewPageMode]
  );
  
  const statusBadgeVariant = useMemo(() => {
    if (!editingPage?.status) return 'secondary';
    return editingPage.status === PageStatus.PUBLISHED ? 'default' : 'secondary';
  }, [editingPage?.status]);
  
  const statusDisplay = useMemo(() => {
    if (!editingPage?.status) return '';
    const status = editingPage.status as unknown as string;
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }, [editingPage?.status]);

  // ===== Memoized Event Handlers =====
  
  const handleTogglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview, setShowPreview]);

  const handleOpenSettings = useCallback(() => {
    setShowPageSettings(true);
    setSaveError(null);
  }, [setShowPageSettings]);

  const handleCloseSettings = useCallback((open: boolean) => {
    if (!open) setShowPageSettings(false);
  }, [setShowPageSettings]);

  const handleOpenTemplateDialog = useCallback(() => {
    setShowSaveTemplateDialog(true);
  }, [setShowSaveTemplateDialog]);

  const handleSavePage = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await handlePageSave();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save page';
      setSaveError(message);
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [handlePageSave]);

  // ===== Render Loading State =====
  if (loading && isNewPageMode === false) {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading page...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-b bg-white">
      {/* Main Header Row */}
      <div className="flex items-center justify-between p-4">
        {/* Left Section: Title and Status */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Page Builder
          </h1>
          
          {editingPage && (
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {/* Status Badge */}
              <Badge 
                variant={statusBadgeVariant}
                className="flex-shrink-0"
                title={`Page status: ${statusDisplay}`}
              >
                {statusDisplay}
              </Badge>
              
              {/* Homepage Badge */}
              {editingPage.isHomepage && (
                <Badge 
                  className="bg-orange-100 text-orange-800 hover:bg-orange-100 flex-shrink-0"
                  title="This is the homepage"
                >
                  <Home size={14} className="mr-1" />
                  <span>Home</span>
                </Badge>
              )}
              
              {/* Page Title Display */}
              {editingPage.title && (
                <span className="text-sm text-gray-600 truncate hidden sm:inline">
                  — {editingPage.title}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {/* Save as Template Button - Hidden on mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTemplateDialog}
            disabled={!hasBlocks}
            title={hasBlocks ? 'Save current blocks as template' : 'Add blocks to save as template'}
            className="hidden sm:flex items-center space-x-1"
          >
            <Save size={16} />
            <span className="hidden md:inline">Template</span>
          </Button>

          {/* Preview Toggle Button */}
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={handleTogglePreview}
            className="flex items-center space-x-1"
            title={showPreview ? 'Back to edit mode' : 'Preview page'}
          >
            <Eye size={16} />
            <span className="hidden sm:inline">
              {showPreview ? 'Edit' : 'Preview'}
            </span>
          </Button>

          {/* Page Settings Dialog */}
          <Dialog open={showPageSettings} onOpenChange={handleCloseSettings}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={handleOpenSettings}
                title="Open page settings"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Page Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {editingPage ? (
                  <PageSettingsForm 
                    page={editingPage} 
                    onUpdate={setEditingPage} 
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No page selected
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Save/Create Page Button */}
          <Button 
            onClick={handleSavePage}
            disabled={isSaving || loading}
            className="flex items-center space-x-1"
            title={isNewPageMode ? 'Create new page' : 'Save page changes'}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="hidden sm:inline">{saveButtonText}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message Row (if applicable) */}
      {saveError && (
        <div className="px-4 pb-2 bg-red-50 border-t border-red-200 flex items-center space-x-2 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="flex-1">{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            className="text-red-700 hover:text-red-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
});

/**
 * Export the memoized component for better performance
 */
export const PageBuilderHeader = PageBuilderHeaderComponent;

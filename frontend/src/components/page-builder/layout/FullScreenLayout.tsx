'use client';

import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { PageBuilderTopBar } from '../PageBuilderTopBar';
import { EditorCanvas } from './EditorCanvas';
import { EditorFooter } from './EditorFooter';
import { LeftPanel } from '../panels/LeftPanel/LeftPanel';
import { RightPanel } from '../panels/RightPanel/RightPanel';
import { usePageState, usePageActions, useUIState } from '../PageBuilderProvider';
import { useToast } from '@/hooks/use-toast';
import { UPDATE_PAGE } from '@/graphql/queries/pages';
import { UpdatePageInput, BlockType } from '@/types/page-builder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BLOCK_TYPES } from '@/constants/blockTypes';

interface FullScreenLayoutProps {
  editorMode: 'visual' | 'code';
  onModeChange: (mode: 'visual' | 'code') => void;
  onExit: () => void;
  onSave: () => void;
}

export function FullScreenLayout({
  editorMode,
  onModeChange,
  onExit,
  onSave,
}: FullScreenLayoutProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  // Get block selection and loading state from context
  const { selectedBlockId, loading, editingPage, setEditingPage } = usePageState();
  const { handleSelectBlock, handleAddChildBlock, handleCloseAddChildDialog } = usePageActions();
  const { showAddChildDialog, addChildParentId } = useUIState();
  const { toast } = useToast();

  // GraphQL mutation for updating page
  const [updatePageMutation] = useMutation(UPDATE_PAGE);

  // Handle saving global page settings
  const handleSettingsSave = useCallback(async (settings: any) => {
    if (!editingPage) {
      toast({
        title: 'Error',
        description: 'No page selected',
        type: 'error',
      });
      return;
    }

    try {
      // Handle seoKeywords - can be string or array
      const seoKeywordsArray = Array.isArray(settings.seoKeywords)
        ? settings.seoKeywords
        : settings.seoKeywords
        ? settings.seoKeywords.split(',').map((k: string) => k.trim())
        : [];

      const updateInput: UpdatePageInput = {
        title: settings.pageTitle,
        slug: settings.pageSlug,
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription,
        seoKeywords: seoKeywordsArray,
      };

      // For new pages (no ID), just update local state
      if (!editingPage?.id) {
        setEditingPage({
          ...editingPage,
          title: settings.pageTitle,
          slug: settings.pageSlug,
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
          seoKeywords: seoKeywordsArray,
        });
        toast({
          title: 'Success',
          description: 'Page settings updated',
          type: 'success',
        });
        return;
      }

      // For existing pages, update via GraphQL
      await updatePageMutation({
        variables: {
          id: editingPage.id,
          input: updateInput,
        },
      });

      // Also update local state
      setEditingPage({
        ...editingPage,
        title: settings.pageTitle,
        slug: settings.pageSlug,
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription,
        seoKeywords: seoKeywordsArray,
      });

      toast({
        title: 'Success',
        description: 'Global settings saved successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save global settings',
        type: 'error',
      });
      throw error;
    }
  }, [editingPage, updatePageMutation, setEditingPage, toast]);

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Unified Top Bar - Consolidated PageBuilderHeader + EditorToolbar */}
      <PageBuilderTopBar
        editorMode={editorMode}
        onModeChange={onModeChange}
        device={device}
        onDeviceChange={setDevice}
        onSave={onSave}
        onExit={onExit}
        leftPanelOpen={leftPanelOpen}
        onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        isLoading={loading}
        onSettingsSave={handleSettingsSave}
        showEditorControls={true}
        showPageInfo={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Component Library */}
        {leftPanelOpen && (
          <LeftPanel
            onClose={() => setLeftPanelOpen(false)}
          />
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorCanvas
            editorMode={editorMode}
            device={device}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
          />
        </div>

        {/* Right Panel - Style & Settings */}
        {rightPanelOpen && (
          <RightPanel
            device={device}
            onClose={() => setRightPanelOpen(false)}
          />
        )}
      </div>

      {/* Bottom Footer */}
      <EditorFooter
        selectedBlockId={selectedBlockId}
        device={device}
      />
      
      {/* Add Child Block Dialog */}
      <Dialog 
        open={showAddChildDialog} 
        onOpenChange={(open) => {
          console.log(`[FullScreenLayout] Dialog onOpenChange:`, open);
          if (!open) handleCloseAddChildDialog();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Child Block to Container</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Select a block type to add to the container
              {addChildParentId && ` (Parent: ${addChildParentId.substring(0, 8)}...)`}
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
            {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
              <Button
                key={type}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:border-blue-500"
                onClick={() => {
                  console.log(`[FullScreenLayout] Block selected:`, type, 'parentId:', addChildParentId);
                  if (addChildParentId) {
                    handleAddChildBlock(addChildParentId, type);
                  }
                }}
              >
                <div className={`p-3 rounded-lg ${color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-medium text-center">{label}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

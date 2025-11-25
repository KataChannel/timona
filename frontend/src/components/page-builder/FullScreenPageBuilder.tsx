'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FullScreenLayout } from './layout/FullScreenLayout';
import { PageBuilderProvider, usePageActions } from './PageBuilderProvider';
import type { PageBlock } from '@/types/page-builder';
import { pageBuilderLogger, LOG_OPERATIONS } from './utils/pageBuilderLogger';

interface FullScreenPageBuilderProps {
  pageId?: string;
  onExit?: () => void;
  initialMode?: 'visual' | 'code';
  initialBlocks?: PageBlock[];
}

/**
 * Internal component that uses the context
 */
function FullScreenPageBuilderInternal({
  onExit,
  initialMode = 'visual',
}: {
  onExit?: () => void;
  initialMode?: 'visual' | 'code';
}) {
  const router = useRouter();
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>(initialMode);
  const { handlePageSave } = usePageActions();

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    } else {
      router.back();
    }
  }, [onExit, router]);

  const handleSave = useCallback(async () => {
    try {
      await handlePageSave();
    } catch (error) {
      pageBuilderLogger.error(LOG_OPERATIONS.PAGE_SAVE, 'Error saving page', { error });
    }
  }, [handlePageSave]);

  return (
    <FullScreenLayout
      editorMode={editorMode}
      onModeChange={setEditorMode}
      onExit={handleExit}
      onSave={handleSave}
    />
  );
}

/**
 * Main FullScreen PageBuilder component with Provider
 */
export function FullScreenPageBuilder({
  pageId,
  onExit,
  initialMode = 'visual',
  initialBlocks = [],
}: FullScreenPageBuilderProps) {
  return (
    <PageBuilderProvider pageId={pageId}>
      <FullScreenPageBuilderInternal
        onExit={onExit}
        initialMode={initialMode}
      />
    </PageBuilderProvider>
  );
}

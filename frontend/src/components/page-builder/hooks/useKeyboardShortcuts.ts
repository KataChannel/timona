'use client';

import { useEffect } from 'react';
import { usePageActions, useHistory } from '../PageBuilderProvider';

/**
 * Keyboard Shortcuts Hook for Page Builder
 * 
 * Handles global keyboard shortcuts:
 * - Ctrl+Z / Cmd+Z: Undo
 * - Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z: Redo
 * - Ctrl+S / Cmd+S: Save (if onSave provided)
 */
export function useKeyboardShortcuts(onSave?: () => void | Promise<void>) {
  const { handleUndo, handleRedo } = usePageActions();
  const history = useHistory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac)
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (!isCtrlOrCmd) return;

      // Undo: Ctrl+Z / Cmd+Z
      if (e.key === 'z' && !e.shiftKey && history.canUndo) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && history.canRedo) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save: Ctrl+S / Cmd+S
      if (e.key === 's' && onSave) {
        e.preventDefault();
        onSave();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo, history.canUndo, history.canRedo, onSave]);
}

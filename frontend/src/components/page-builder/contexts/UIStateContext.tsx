'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

/**
 * UI State Context - Manages UI state (modals, dialogs, panels)
 */
interface UIStateContextType {
  // UI state
  showPageSettings: boolean;
  showPreview: boolean;
  showAddChildDialog: boolean;
  addChildParentId: string | null;
  
  // State setters
  setShowPageSettings: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setShowAddChildDialog: (show: boolean) => void;
  setAddChildParentId: (id: string | null) => void;
  
  // Combined setter for atomic updates
  openAddChildDialog: (parentId: string) => void;
  closeAddChildDialog: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

interface UIStateProviderProps {
  children: ReactNode;
}

export function UIStateProvider({ children }: UIStateProviderProps) {
  const [showPageSettings, setShowPageSettingsState] = useState(false);
  const [showPreview, setShowPreviewState] = useState(false);
  const [showAddChildDialog, setShowAddChildDialogState] = useState(false);
  const [addChildParentId, setAddChildParentIdState] = useState<string | null>(null);
  
  // Version counter to force context updates
  const [version, setVersion] = useState(0);
  
  // Debug: Log state changes
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[UIStateContext] State changed:`, {
        showAddChildDialog,
        addChildParentId,
        version,
        timestamp: Date.now(),
      });
    }
    // Increment version when critical state changes
    setVersion(v => v + 1);
  }, [showAddChildDialog, addChildParentId]);
  
  // Memoized setters for stable references - prevents unnecessary re-renders
  const setShowPageSettings = useCallback((show: boolean) => {
    setShowPageSettingsState(show);
  }, []);
  
  const setShowPreview = useCallback((show: boolean) => {
    setShowPreviewState(show);
  }, []);
  
  const setShowAddChildDialog = useCallback((show: boolean) => {
    console.log(`[UIStateContext] setShowAddChildDialog called with:`, show);
    setShowAddChildDialogState(show);
    console.log(`[UIStateContext] showAddChildDialog state will be:`, show);
  }, []);
  
  const setAddChildParentId = useCallback((id: string | null) => {
    console.log(`[UIStateContext] setAddChildParentId called with:`, id);
    setAddChildParentIdState(id);
  }, []);
  
  // Atomic operations for Add Child Dialog
  const openAddChildDialog = useCallback((parentId: string) => {
    console.log(`[UIStateContext] openAddChildDialog called with parentId:`, parentId);
    
    // Use functional updates to ensure both states update together
    setAddChildParentIdState(parentId);
    setShowAddChildDialogState(true);
    
    console.log(`[UIStateContext] Dialog should open for parent:`, parentId);
  }, []); // Empty deps - uses setter functions which are stable
  
  const closeAddChildDialog = useCallback(() => {
    console.log(`[UIStateContext] closeAddChildDialog called`);
    setShowAddChildDialogState(false);
    setAddChildParentIdState(null);
  }, []);
  
  // Context value WITHOUT memoization for testing
  // This ensures consumers always get fresh state
  // Include version to force new object reference
  const value: UIStateContextType = {
    showPageSettings,
    showPreview,
    showAddChildDialog,
    addChildParentId,
    setShowPageSettings,
    setShowPreview,
    setShowAddChildDialog,
    setAddChildParentId,
    openAddChildDialog,
    closeAddChildDialog,
    _version: version, // Internal version tracker
  } as any;
  
  // Log when context value changes
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[UIStateContext] Context value updated (v${version}):`, {
        showAddChildDialog: value.showAddChildDialog,
        addChildParentId: value.addChildParentId,
      });
    }
  }, [value.showAddChildDialog, value.addChildParentId, version]);
  
  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    // Return default values instead of throwing during SSR or initial render
    if (typeof window === 'undefined') {
      return {
        showPageSettings: false,
        showPreview: false,
        showAddChildDialog: false,
        addChildParentId: null,
        setShowPageSettings: () => {},
        setShowPreview: () => {},
        setShowAddChildDialog: () => {},
        setAddChildParentId: () => {},
        openAddChildDialog: () => {},
        closeAddChildDialog: () => {},
      } as UIStateContextType;
    }
    throw new Error(
      'useUIState must be used within a UIStateProvider. ' +
      'Make sure your component is wrapped with <PageBuilderProvider>'
    );
  }
  return context;
}

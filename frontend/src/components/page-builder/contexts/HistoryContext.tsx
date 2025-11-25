'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PageBlock } from '@/types/page-builder';

/**
 * History State Interface
 */
interface HistoryState {
  blocks: PageBlock[];
  timestamp: number;
  action: string; // Description of the action
}

/**
 * History Context Type
 */
interface HistoryContextType {
  // History state
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  historySize: number;
  
  // Actions
  undo: () => PageBlock[] | null;
  redo: () => PageBlock[] | null;
  pushHistory: (blocks: PageBlock[], action: string) => void;
  clearHistory: () => void;
  
  // Get current state info
  getCurrentAction: () => string;
  getUndoAction: () => string | null;
  getRedoAction: () => string | null;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export { HistoryContext };

interface HistoryProviderProps {
  children: ReactNode;
  maxHistorySize?: number; // Maximum history items to keep (default: 50)
}

/**
 * History Provider Component
 * 
 * Implements undo/redo functionality for page builder
 * - Maintains history stack with configurable size limit
 * - Tracks current position in history
 * - Provides undo/redo capabilities
 * - Smart memory management (removes old entries)
 */
export function HistoryProvider({ children, maxHistorySize = 50 }: HistoryProviderProps) {
  // History stack - array of historical states
  const [history, setHistory] = useState<HistoryState[]>([]);
  
  // Current position in history (index)
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  /**
   * Push new state to history
   * - Clears any redo history when new action is performed
   * - Maintains max size limit
   */
  const pushHistory = useCallback((blocks: PageBlock[], action: string) => {
    setHistory((prevHistory) => {
      // Remove any redo entries (everything after current index)
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      
      // Add new state
      newHistory.push({
        blocks: JSON.parse(JSON.stringify(blocks)), // Deep clone to prevent mutations
        timestamp: Date.now(),
        action,
      });
      
      // Trim history if exceeds max size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(newHistory.length - maxHistorySize);
      }
      
      return newHistory;
    });
    
    // Move index to new position
    setHistoryIndex((prevIndex) => {
      const newLength = Math.min(historyIndex + 2, maxHistorySize);
      return newLength - 1;
    });
  }, [historyIndex, maxHistorySize]);
  
  /**
   * Undo - Go back one step in history
   */
  const undo = useCallback((): PageBlock[] | null => {
    if (historyIndex <= 0) return null;
    
    const previousIndex = historyIndex - 1;
    setHistoryIndex(previousIndex);
    
    // Return the previous state's blocks
    return JSON.parse(JSON.stringify(history[previousIndex].blocks));
  }, [historyIndex, history]);
  
  /**
   * Redo - Go forward one step in history
   */
  const redo = useCallback((): PageBlock[] | null => {
    if (historyIndex >= history.length - 1) return null;
    
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    
    // Return the next state's blocks
    return JSON.parse(JSON.stringify(history[nextIndex].blocks));
  }, [historyIndex, history]);
  
  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);
  
  /**
   * Get current action description
   */
  const getCurrentAction = useCallback((): string => {
    if (historyIndex < 0 || historyIndex >= history.length) return '';
    return history[historyIndex].action;
  }, [historyIndex, history]);
  
  /**
   * Get undo action description (what will be undone)
   */
  const getUndoAction = useCallback((): string | null => {
    if (historyIndex <= 0) return null;
    return history[historyIndex].action;
  }, [historyIndex, history]);
  
  /**
   * Get redo action description (what will be redone)
   */
  const getRedoAction = useCallback((): string | null => {
    if (historyIndex >= history.length - 1) return null;
    return history[historyIndex + 1].action;
  }, [historyIndex, history]);
  
  // Computed properties
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const historySize = history.length;
  
  const value: HistoryContextType = {
    canUndo,
    canRedo,
    historyIndex,
    historySize,
    undo,
    redo,
    pushHistory,
    clearHistory,
    getCurrentAction,
    getUndoAction,
    getRedoAction,
  };
  
  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

/**
 * Hook to use History Context
 */
export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    // Return default values for SSR or when not wrapped in provider
    if (typeof window === 'undefined') {
      return {
        canUndo: false,
        canRedo: false,
        historyIndex: -1,
        historySize: 0,
        undo: () => null,
        redo: () => null,
        pushHistory: () => {},
        clearHistory: () => {},
        getCurrentAction: () => '',
        getUndoAction: () => null,
        getRedoAction: () => null,
      } as HistoryContextType;
    }
    throw new Error(
      'useHistory must be used within a HistoryProvider. ' +
      'Make sure your component is wrapped with <PageBuilderProvider>'
    );
  }
  return context;
}

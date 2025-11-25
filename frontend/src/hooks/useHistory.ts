/**
 * PageBuilder Advanced Features - Undo/Redo System
 * Phase 6.1: History Manager
 * 
 * Manages state history for undo/redo functionality with:
 * - 50-state history buffer
 * - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 * - State serialization
 * - Branch support
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface HistoryState<T = any> {
  state: T;
  timestamp: number;
  description?: string;
  id: string;
}

export interface HistoryManagerOptions {
  maxStates?: number;
  enableKeyboardShortcuts?: boolean;
}

export interface UseHistoryResult<T> {
  // Current state
  currentState: T;
  canUndo: boolean;
  canRedo: boolean;
  
  // History info
  historyLength: number;
  currentIndex: number;
  history: HistoryState<T>[];
  
  // Actions
  pushState: (state: T, description?: string) => void;
  undo: () => void;
  redo: () => void;
  jumpToState: (index: number) => void;
  clearHistory: () => void;
  
  // Utilities
  getStateAt: (index: number) => T | null;
  exportHistory: () => string;
  importHistory: (jsonString: string) => boolean;
}

// ============================================================================
// History Manager Hook
// ============================================================================

export function useHistory<T>(
  initialState: T,
  options: HistoryManagerOptions = {}
): UseHistoryResult<T> {
  const {
    maxStates = 50,
    enableKeyboardShortcuts = true,
  } = options;

  // Generate unique ID
  const generateId = () => `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Initialize history with initial state
  const [history, setHistory] = useState<HistoryState<T>[]>([
    {
      state: initialState,
      timestamp: Date.now(),
      description: 'Initial state',
      id: generateId(),
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Track if we're applying a history state (to prevent pushing during undo/redo)
  const isApplyingHistoryRef = useRef(false);

  // Current state
  const currentState = history[currentIndex]?.state || initialState;

  // Can undo/redo
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Push new state to history
  const pushState = useCallback(
    (state: T, description?: string) => {
      // Don't push if we're applying a history state
      if (isApplyingHistoryRef.current) {
        return;
      }

      setHistory((prev) => {
        // Remove all states after current index (branching)
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add new state
        newHistory.push({
          state,
          timestamp: Date.now(),
          description,
          id: generateId(),
        });

        // Limit history size
        if (newHistory.length > maxStates) {
          return newHistory.slice(newHistory.length - maxStates);
        }

        return newHistory;
      });

      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        return Math.min(newIndex, maxStates - 1);
      });
    },
    [currentIndex, maxStates]
  );

  // Undo
  const undo = useCallback(() => {
    if (canUndo) {
      isApplyingHistoryRef.current = true;
      setCurrentIndex((prev) => prev - 1);
      // Reset flag after state update
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 0);
    }
  }, [canUndo]);

  // Redo
  const redo = useCallback(() => {
    if (canRedo) {
      isApplyingHistoryRef.current = true;
      setCurrentIndex((prev) => prev + 1);
      // Reset flag after state update
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 0);
    }
  }, [canRedo]);

  // Jump to specific state
  const jumpToState = useCallback(
    (index: number) => {
      if (index >= 0 && index < history.length) {
        isApplyingHistoryRef.current = true;
        setCurrentIndex(index);
        setTimeout(() => {
          isApplyingHistoryRef.current = false;
        }, 0);
      }
    },
    [history.length]
  );

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([
      {
        state: currentState,
        timestamp: Date.now(),
        description: 'History cleared',
        id: generateId(),
      },
    ]);
    setCurrentIndex(0);
  }, [currentState]);

  // Get state at index
  const getStateAt = useCallback(
    (index: number): T | null => {
      return history[index]?.state || null;
    },
    [history]
  );

  // Export history as JSON
  const exportHistory = useCallback((): string => {
    return JSON.stringify({
      history,
      currentIndex,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }, [history, currentIndex]);

  // Import history from JSON
  const importHistory = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data.history) || typeof data.currentIndex !== 'number') {
        return false;
      }

      setHistory(data.history);
      setCurrentIndex(data.currentIndex);
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  return {
    currentState,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex,
    history,
    pushState,
    undo,
    redo,
    jumpToState,
    clearHistory,
    getStateAt,
    exportHistory,
    importHistory,
  };
}

// ============================================================================
// History Manager Class (Alternative API)
// ============================================================================

export class HistoryManager<T> {
  private history: HistoryState<T>[] = [];
  private currentIndex = 0;
  private maxStates: number;
  private listeners: Set<() => void> = new Set();

  constructor(initialState: T, maxStates = 50) {
    this.maxStates = maxStates;
    this.history.push({
      state: initialState,
      timestamp: Date.now(),
      description: 'Initial state',
      id: this.generateId(),
    });
  }

  private generateId(): string {
    return `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getCurrentState(): T {
    return this.history[this.currentIndex].state;
  }

  pushState(state: T, description?: string): void {
    // Remove all states after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push({
      state,
      timestamp: Date.now(),
      description,
      id: this.generateId(),
    });

    // Limit history size
    if (this.history.length > this.maxStates) {
      this.history = this.history.slice(this.history.length - this.maxStates);
    }

    this.currentIndex = this.history.length - 1;
    this.notify();
  }

  undo(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notify();
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.notify();
      return true;
    }
    return false;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  jumpToState(index: number): boolean {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      this.notify();
      return true;
    }
    return false;
  }

  getHistory(): HistoryState<T>[] {
    return [...this.history];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  clear(): void {
    const currentState = this.getCurrentState();
    this.history = [{
      state: currentState,
      timestamp: Date.now(),
      description: 'History cleared',
      id: this.generateId(),
    }];
    this.currentIndex = 0;
    this.notify();
  }
}

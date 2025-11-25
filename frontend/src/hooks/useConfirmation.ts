/**
 * PageBuilder Template System - Confirmation Dialog Hook
 * Phase 5.4: Integration
 * 
 * Hook for handling confirmation dialogs for destructive template operations
 */

'use client';

import { useState } from 'react';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  onConfirm: (() => void) | null;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    onConfirm: null,
  });

  const confirm = (options: ConfirmationOptions, onConfirm: () => void) => {
    setState({
      isOpen: true,
      options,
      onConfirm,
    });
  };

  const handleConfirm = () => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    setState({ isOpen: false, options: null, onConfirm: null });
  };

  const handleCancel = () => {
    setState({ isOpen: false, options: null, onConfirm: null });
  };

  return {
    isOpen: state.isOpen,
    options: state.options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

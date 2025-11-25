import { useState, useCallback } from 'react';

/**
 * Form State Management Hook
 * 
 * Provides utilities for managing form state:
 * - Field updates
 * - Error tracking
 * - Dirty state
 * - Reset functionality
 * 
 * @example
 * ```tsx
 * const form = useFormState({
 *   name: '',
 *   email: '',
 *   age: 0
 * });
 * 
 * <input
 *   value={form.data.name}
 *   onChange={(e) => form.updateField('name', e.target.value)}
 * />
 * 
 * {form.errors.name && <span>{form.errors.name}</span>}
 * ```
 */

export interface UseFormStateReturn<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  
  updateField: (field: keyof T, value: any) => void;
  updateFields: (updates: Partial<T>) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  reset: () => void;
  resetToInitial: () => void;
}

export function useFormState<T extends Record<string, any>>(
  initialState: T
): UseFormStateReturn<T> {
  const [data, setData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for this field when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);
  
  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);
  
  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const reset = useCallback(() => {
    setData({} as T);
    setErrors({});
    setIsDirty(false);
  }, []);
  
  const resetToInitial = useCallback(() => {
    setData(initialState);
    setErrors({});
    setIsDirty(false);
  }, [initialState]);
  
  return {
    data,
    setData,
    errors,
    setErrors,
    isDirty,
    setIsDirty,
    updateField,
    updateFields,
    setError,
    clearError,
    clearErrors,
    reset,
    resetToInitial,
  };
}

/**
 * Form Handlers Generator
 * 
 * Creates common form handlers for inputs, selects, and toggles
 * 
 * @example
 * ```tsx
 * const handlers = useFormHandlers(formState);
 * 
 * <input 
 *   name="email"
 *   value={formState.data.email}
 *   onChange={handlers.handleChange}
 * />
 * 
 * <Switch
 *   checked={formState.data.enabled}
 *   onCheckedChange={handlers.handleToggle('enabled')}
 * />
 * ```
 */

export interface UseFormHandlersReturn<T> {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelect: (field: keyof T) => (value: any) => void;
  handleToggle: (field: keyof T) => (value?: boolean) => void;
  handleNumber: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useFormHandlers<T extends Record<string, any>>(
  formState: UseFormStateReturn<T>
): UseFormHandlersReturn<T> {
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    formState.updateField(name as keyof T, value);
  }, [formState]);
  
  const handleSelect = useCallback((field: keyof T) => (value: any) => {
    formState.updateField(field, value);
  }, [formState]);
  
  const handleToggle = useCallback((field: keyof T) => (value?: boolean) => {
    if (typeof value === 'boolean') {
      formState.updateField(field, value);
    } else {
      formState.updateField(field, !formState.data[field]);
    }
  }, [formState]);
  
  const handleNumber = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    formState.updateField(field, value);
  }, [formState]);
  
  return {
    handleChange,
    handleSelect,
    handleToggle,
    handleNumber,
  };
}

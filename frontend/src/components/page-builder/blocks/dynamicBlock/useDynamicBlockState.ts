/**
 * Custom Hook: useDynamicBlockState
 * Centralized state management using useReducer
 * Prevents infinite loops and simplifies state management
 */

import { useReducer, useCallback } from 'react';
import { DynamicBlockState, DynamicBlockAction } from './types';
import { DynamicBlockConfig } from '@/types/page-builder';

/**
 * Initial state factory
 */
function createInitialState(config: DynamicBlockConfig, template: string): DynamicBlockState {
  return {
    isEditing: false,
    isFullscreenEditor: false,
    editConfig: config || {},
    selectedTemplate: null,
    templateEdit: template || '',
    data: null,
    loading: false,
    error: null,
    staticDataText: '',
    staticDataError: null,
    hasValidationError: false,
    repeaterDataText: '',
    repeaterDataError: null,
    repeaterValidationError: false,
    repeaterItemsData: [],
    limitText: '',
    limitError: null,
    limitValidationError: false,
    apiTestResult: null,
    apiTestLoading: false,
    apiTestError: null,
  };
}

/**
 * Reducer function - centralized state updates
 */
function dynamicBlockReducer(state: DynamicBlockState, action: DynamicBlockAction): DynamicBlockState {
  switch (action.type) {
    // UI Actions
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    
    case 'SET_FULLSCREEN_EDITOR':
      return { ...state, isFullscreenEditor: action.payload };
    
    // Config & Template Actions
    case 'SET_EDIT_CONFIG':
      return { ...state, editConfig: action.payload };
    
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    
    case 'SET_TEMPLATE_EDIT':
      return { ...state, templateEdit: action.payload };
    
    // Data Loading
    case 'SET_DATA_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_DATA':
      return { ...state, data: action.payload, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    // Static Data Validation
    case 'SET_STATIC_DATA_TEXT':
      return { ...state, staticDataText: action.payload };
    
    case 'SET_STATIC_DATA_ERROR':
      return {
        ...state,
        staticDataError: action.payload.error,
        hasValidationError: action.payload.hasError,
      };
    
    case 'RESET_STATIC_DATA_VALIDATION':
      return {
        ...state,
        staticDataError: null,
        hasValidationError: false,
      };
    
    // Repeater Data Validation
    case 'SET_REPEATER_DATA_TEXT':
      return { ...state, repeaterDataText: action.payload };
    
    case 'SET_REPEATER_DATA_ERROR':
      return {
        ...state,
        repeaterDataError: action.payload.error,
        repeaterValidationError: action.payload.hasError,
        repeaterItemsData: action.payload.items,
      };
    
    case 'RESET_REPEATER_DATA_VALIDATION':
      return {
        ...state,
        repeaterDataError: null,
        repeaterValidationError: false,
      };
    
    // Limit Validation
    case 'SET_LIMIT_TEXT':
      return { ...state, limitText: action.payload };
    
    case 'SET_LIMIT_ERROR':
      return {
        ...state,
        limitError: action.payload.error,
        limitValidationError: action.payload.hasError,
      };
    
    case 'RESET_LIMIT_VALIDATION':
      return {
        ...state,
        limitError: null,
        limitValidationError: false,
      };
    
    // API Testing
    case 'SET_API_TEST_LOADING':
      return { ...state, apiTestLoading: action.payload };
    
    case 'SET_API_TEST_RESULT':
      return { ...state, apiTestResult: action.payload, apiTestError: null };
    
    case 'SET_API_TEST_ERROR':
      return { ...state, apiTestError: action.payload };
    
    case 'RESET_API_TEST':
      return {
        ...state,
        apiTestResult: null,
        apiTestLoading: false,
        apiTestError: null,
      };
    
    default:
      return state;
  }
}

/**
 * Custom Hook: useDynamicBlockState
 * Manages all state for DynamicBlock component
 */
export function useDynamicBlockState(config: DynamicBlockConfig, template: string) {
  const [state, dispatch] = useReducer(
    dynamicBlockReducer,
    { config, template },
    ({ config, template }) => createInitialState(config, template)
  );

  // UI Actions - memoized callbacks
  const setEditing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_EDITING', payload: value });
  }, []);

  const setFullscreenEditor = useCallback((value: boolean) => {
    dispatch({ type: 'SET_FULLSCREEN_EDITOR', payload: value });
  }, []);

  // Config & Template Actions
  const setEditConfig = useCallback((config: DynamicBlockConfig) => {
    dispatch({ type: 'SET_EDIT_CONFIG', payload: config });
  }, []);

  const setSelectedTemplate = useCallback((template: any | null) => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
  }, []);

  const setTemplateEdit = useCallback((template: string) => {
    dispatch({ type: 'SET_TEMPLATE_EDIT', payload: template });
  }, []);

  // Data Actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_DATA_LOADING', payload: loading });
  }, []);

  const setData = useCallback((data: any) => {
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Static Data Validation
  const setStaticDataText = useCallback((text: string) => {
    dispatch({ type: 'SET_STATIC_DATA_TEXT', payload: text });
  }, []);

  const setStaticDataError = useCallback((error: string | null, hasError: boolean) => {
    dispatch({ type: 'SET_STATIC_DATA_ERROR', payload: { error, hasError } });
  }, []);

  const resetStaticDataValidation = useCallback(() => {
    dispatch({ type: 'RESET_STATIC_DATA_VALIDATION' });
  }, []);

  // Repeater Data Validation
  const setRepeaterDataText = useCallback((text: string) => {
    dispatch({ type: 'SET_REPEATER_DATA_TEXT', payload: text });
  }, []);

  const setRepeaterDataError = useCallback((error: string | null, hasError: boolean, items: any[] = []) => {
    dispatch({ type: 'SET_REPEATER_DATA_ERROR', payload: { error, hasError, items } });
  }, []);

  const resetRepeaterDataValidation = useCallback(() => {
    dispatch({ type: 'RESET_REPEATER_DATA_VALIDATION' });
  }, []);

  // Limit Validation
  const setLimitText = useCallback((text: string) => {
    dispatch({ type: 'SET_LIMIT_TEXT', payload: text });
  }, []);

  const setLimitError = useCallback((error: string | null, hasError: boolean) => {
    dispatch({ type: 'SET_LIMIT_ERROR', payload: { error, hasError } });
  }, []);

  const resetLimitValidation = useCallback(() => {
    dispatch({ type: 'RESET_LIMIT_VALIDATION' });
  }, []);

  // API Testing
  const setApiTestLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_API_TEST_LOADING', payload: loading });
  }, []);

  const setApiTestResult = useCallback((result: any) => {
    dispatch({ type: 'SET_API_TEST_RESULT', payload: result });
  }, []);

  const setApiTestError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_API_TEST_ERROR', payload: error });
  }, []);

  const resetApiTest = useCallback(() => {
    dispatch({ type: 'RESET_API_TEST' });
  }, []);

  return {
    state,
    // UI Actions
    setEditing,
    setFullscreenEditor,
    // Config & Template Actions
    setEditConfig,
    setSelectedTemplate,
    setTemplateEdit,
    // Data Actions
    setLoading,
    setData,
    setError,
    // Static Data Validation
    setStaticDataText,
    setStaticDataError,
    resetStaticDataValidation,
    // Repeater Data Validation
    setRepeaterDataText,
    setRepeaterDataError,
    resetRepeaterDataValidation,
    // Limit Validation
    setLimitText,
    setLimitError,
    resetLimitValidation,
    // API Testing
    setApiTestLoading,
    setApiTestResult,
    setApiTestError,
    resetApiTest,
  };
}

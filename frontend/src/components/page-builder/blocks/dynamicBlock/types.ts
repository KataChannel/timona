/**
 * Dynamic Block Type Definitions
 * Centralized types for better maintainability
 */

import { PageBlock, DynamicBlockConfig } from '@/types/page-builder';

/**
 * Editor state management
 */
export interface DynamicBlockState {
  // UI State
  isEditing: boolean;
  isFullscreenEditor: boolean;
  
  // Template & Config
  editConfig: DynamicBlockConfig;
  selectedTemplate: any | null;
  templateEdit: string;
  
  // Data State
  data: any | null;
  loading: boolean;
  error: string | null;
  
  // Static Data Validation
  staticDataText: string;
  staticDataError: string | null;
  hasValidationError: boolean;
  
  // Repeater Data Validation
  repeaterDataText: string;
  repeaterDataError: string | null;
  repeaterValidationError: boolean;
  repeaterItemsData: any[];
  
  // Limit Validation
  limitText: string;
  limitError: string | null;
  limitValidationError: boolean;
  
  // API Testing
  apiTestResult: any | null;
  apiTestLoading: boolean;
  apiTestError: string | null;
}

/**
 * Action types for useReducer
 */
export type DynamicBlockAction =
  // UI Actions
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_FULLSCREEN_EDITOR'; payload: boolean }
  
  // Config & Template Actions
  | { type: 'SET_EDIT_CONFIG'; payload: DynamicBlockConfig }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: any | null }
  | { type: 'SET_TEMPLATE_EDIT'; payload: string }
  
  // Data Loading
  | { type: 'SET_DATA_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: any }
  | { type: 'SET_ERROR'; payload: string | null }
  
  // Static Data Validation
  | { type: 'SET_STATIC_DATA_TEXT'; payload: string }
  | { type: 'SET_STATIC_DATA_ERROR'; payload: { error: string | null; hasError: boolean } }
  | { type: 'RESET_STATIC_DATA_VALIDATION' }
  
  // Repeater Data Validation
  | { type: 'SET_REPEATER_DATA_TEXT'; payload: string }
  | { type: 'SET_REPEATER_DATA_ERROR'; payload: { error: string | null; hasError: boolean; items: any[] } }
  | { type: 'RESET_REPEATER_DATA_VALIDATION' }
  
  // Limit Validation
  | { type: 'SET_LIMIT_TEXT'; payload: string }
  | { type: 'SET_LIMIT_ERROR'; payload: { error: string | null; hasError: boolean } }
  | { type: 'RESET_LIMIT_VALIDATION' }
  
  // API Testing
  | { type: 'SET_API_TEST_LOADING'; payload: boolean }
  | { type: 'SET_API_TEST_RESULT'; payload: any }
  | { type: 'SET_API_TEST_ERROR'; payload: string | null }
  | { type: 'RESET_API_TEST' };

/**
 * Props for Dynamic Block Component
 */
export interface DynamicBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
}

/**
 * Template Processing Options
 */
export interface TemplateProcessingOptions {
  data: any;
  repeater?: {
    enabled: boolean;
    data?: any[];
    limit?: number;
  };
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
  }>;
}

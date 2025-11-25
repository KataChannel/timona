/**
 * Custom React Hooks
 * 
 * Collection of reusable hooks for common patterns:
 * - Data table management
 * - Modal/dialog state
 * - Form state management
 * - Async operations
 * - Debouncing/throttling
 * - SSR-safe utilities
 */

// Data table hooks
export { useDataTable } from './useDataTable';
export type { UseDataTableOptions, UseDataTableReturn } from './useDataTable';

// Modal hooks
export { useModal, useModalWithData } from './useModal';
export type { UseModalReturn, UseModalWithDataReturn } from './useModal';

// Form state hooks
export { useFormState, useFormHandlers } from './useFormState';
export type { UseFormStateReturn, UseFormHandlersReturn } from './useFormState';

// Async action hooks
export { useAsyncAction, useAsyncActions, useMutation } from './useAsyncAction';
export type { 
  UseAsyncActionReturn,
  AsyncActions,
  UseMutationResult 
} from './useAsyncAction';

// Debounce hooks
export { 
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useDebouncedState 
} from './useDebounce';

// Mounting and SSR hooks
export { 
  useMounted,
  useClientOnly,
  useIsBrowser,
  useHydrationSafe,
  useWindowSize,
  useMediaQuery,
  useIsOnline 
} from './useMounted';
export type { WindowSize } from './useMounted';

// Error notification hooks
export { useErrorNotification, parseGraphQLError } from './useErrorNotification';
export type { ErrorNotification } from './useErrorNotification';
